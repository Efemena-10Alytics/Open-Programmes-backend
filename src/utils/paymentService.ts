import axios from "axios";
import { prismadb } from "../index";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const generatePaymentLink = async (
  userId: string,
  paymentType: string,
  itemId: string,
  amount: number, // in kobo
  description: string
): Promise<string> => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: await getUserEmail(userId),
        amount,
        metadata: {
          userId,
          paymentType,
          itemId,
          custom_fields: [
            {
              display_name: "Payment For",
              variable_name: "payment_for",
              value: description
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.data.authorization_url;
  } catch (error) {
    console.error("Error generating payment link:", error);
    throw new Error("Failed to generate payment link");
  }
};

export const verifyPaystackPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw new Error("Payment verification failed");
  }
};

const getUserEmail = async (userId: string): Promise<string> => {
  const user = await prismadb.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });
  
  return user.email;
};