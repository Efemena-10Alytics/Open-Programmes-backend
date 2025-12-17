"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const { PrismaClient } = require("@prisma/client");
// const Queue = require("bull");
const { config } = require("dotenv");
const { Resend } = require("resend");
config();
const prismadb = new PrismaClient();
// Validate environment variables
const requiredEnvVars = [
    // "REDIS_URL",
    "RESEND_API_KEY",
    "NEXT_PUBLIC_APP_URL",
    "EMAIL_FROM",
];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Environment variable ${varName} is not set`);
    }
});
const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL;
// Helper function to get payment plan from record (supports both old and new fields)
function getPaymentPlan(payment) {
    return payment.paymentPlan || payment.paymentType || null;
}
// Function to handle expired payments
const handleExpiredPayments = async () => {
    try {
        console.log("Began processing expired payments");
        const now = new Date();
        // Find payments that are either:
        // 1. FIRST_HALF_COMPLETE with overdue second payment
        // 2. Installment plans with overdue payments
        const expiredPayments = await prismadb.paymentStatus.findMany({
            where: {
                OR: [
                    {
                        paymentPlan: "FIRST_HALF_COMPLETE",
                        status: "BALANCE_HALF_PAYMENT",
                        secondPaymentDueDate: {
                            lt: now,
                        },
                    },
                    {
                        paymentPlan: { in: ["THREE_INSTALLMENTS", "FOUR_INSTALLMENTS"] },
                        status: { not: "EXPIRED" },
                        paymentInstallments: {
                            some: {
                                paid: false,
                                dueDate: {
                                    lt: now,
                                },
                            },
                        },
                    },
                ],
            },
            include: {
                user: true,
                paymentInstallments: true,
            },
        });
        let successCount = 0;
        let failureCount = 0;
        for (const payment of expiredPayments) {
            try {
                const paymentPlan = getPaymentPlan(payment);
                await prismadb.$transaction(async (prisma) => {
                    // For FIRST_HALF_COMPLETE, mark as expired
                    if (paymentPlan === "FIRST_HALF_COMPLETE") {
                        await prisma.paymentStatus.update({
                            where: {
                                userId_courseId: {
                                    userId: payment.userId,
                                    courseId: payment.courseId,
                                },
                            },
                            data: {
                                status: "EXPIRED",
                            },
                        });
                    }
                    // For installment plans, mark unpaid overdue installments as expired
                    else if (["THREE_INSTALLMENTS", "FOUR_INSTALLMENTS"].includes(paymentPlan)) {
                        await prisma.paymentStatus.update({
                            where: {
                                userId_courseId: {
                                    userId: payment.userId,
                                    courseId: payment.courseId,
                                },
                            },
                            data: {
                                status: "EXPIRED",
                            },
                        });
                    }
                    // Deactivate payment access
                    await prisma.userCohort.updateMany({
                        where: {
                            userId: payment.userId,
                            courseId: payment.courseId,
                        },
                        data: {
                            isPaymentActive: false,
                        },
                    });
                });
                const course = await prismadb.course.findUnique({
                    where: {
                        id: payment.courseId,
                    },
                    select: {
                        title: true,
                    }
                });
                // Determine payment type for email message
                let paymentTypeMessage = "";
                if (paymentPlan === "FIRST_HALF_COMPLETE") {
                    paymentTypeMessage = "second installment";
                }
                else if (["THREE_INSTALLMENTS", "FOUR_INSTALLMENTS"].includes(paymentPlan)) {
                    const unpaidInstallments = payment.paymentInstallments.filter(i => !i.paid && new Date(i.dueDate) < now);
                    paymentTypeMessage = `installment ${unpaidInstallments.map(i => i.installmentNumber).join(", ")}`;
                }
                // Send email to the user
                const renewLink = `${domain}?type=renew-payment&courseId=${payment.courseId}&userId=${payment.userId}`;
                await resend.emails.send({
                    from: process.env.EMAIL_FROM,
                    to: payment.user.email,
                    subject: "Course Payment Expired - Action Required",
                    html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Course Payment Expired</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                    color: #333;
                    text-align: center;
                  }
                  p {
                    color: #555;
                    line-height: 1.6;
                  }
                  .course-name {
                    font-weight: bold;
                    color: #0066cc;
                  }
                  .renew-link {
                    display: block;
                    text-align: center;
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #0066cc;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Course Payment Expired</h1>
                  <p>Dear ${payment.user.name},</p>
                  <p>We hope this email finds you well. We wanted to inform you that your ${paymentTypeMessage} payment for the course <span class="course-name">${course.title}</span> has expired.</p>
                  <p>To continue accessing the course materials and participating in the cohort, you need to renew your payment. Please note that until the payment is renewed, your access to the course will be restricted.</p>
                  ${paymentPlan === "FIRST_HALF_COMPLETE" ?
                        `<p>You can renew your payment for half of the original course fee. This will grant you full access to the course again.</p>` :
                        `<p>You can renew your outstanding installment payments to restore access to the course.</p>`}
                  <a class="renew-link" href="${renewLink}">Renew Your Payment</a>
                  <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                  <p>Thank you for your understanding and continued interest in our courses.</p>
                  <p>Best regards,<br>Your Learning Team</p>
                </div>
              </body>
            </html>
          `,
                });
                console.log(`Processed expired payment for user ${payment.userId} and course ${payment.courseId}`);
                successCount++;
            }
            catch (error) {
                console.error(`Error processing payment for user ${payment.userId} and course ${payment.courseId}:`, error);
                failureCount++;
            }
        }
        console.log(`Processed ${expiredPayments.length} expired payments. Successes: ${successCount}, Failures: ${failureCount}`);
    }
    catch (error) {
        console.error("Error processing expired payments:", error);
    }
};
console.log("Initiate handleExpiredPayment function");
handleExpiredPayments();
console.log("Handle expired payments completed");
console.log("Check expired payments job scheduled");
//# sourceMappingURL=check-due-payment-cronjob.js.map