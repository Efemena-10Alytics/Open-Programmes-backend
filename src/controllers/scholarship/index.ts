import { Request, Response } from "express";
import { prismadb } from "../../index";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendIWDRegistrationEmail } from "./mail";

export async function applyForScholarship(req: Request, res: Response) {
    try {
        const { fullName, email, phone_number, country, gender, program, cohort, discountCode } = req.body;

        // Capture password from multiple potential keys just in case
        const rawPassword = req.body.password || req.body.Password;

        if (!fullName || !email || !phone_number || !country || !gender || !program || !cohort) {
            return res.status(400).json({ message: "Fill in all required fields!" });
        }

        const emailLower = email ? email.trim().toLowerCase() : "";
        console.log(`[SCHOLARSHIP_TRACE]: Processing ${emailLower}. Password received: ${!!rawPassword} (${typeof rawPassword})`);

        // 1. Hash password if provided
        let hashedPassword = null;
        if (rawPassword && typeof rawPassword === 'string' && rawPassword.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(rawPassword.trim(), salt);
            console.log(`[SCHOLARSHIP_TRACE]: Password hashed successfully for ${emailLower}`);
        } else {
            console.warn(`[SCHOLARSHIP_TRACE]: NO VALID PASSWORD detected for ${emailLower}.`);
        }

        // 2. User Handling (Create or Update)
        let user = await prismadb.user.findFirst({
            where: {
                OR: [
                    { email: emailLower },
                    { phone_number: phone_number }
                ]
            }
        });

        // Prepare standard tokens upfront
        const generateTokens = (u: any) => {
            const payload = { email: u.email, id: u.id, role: u.role };
            const access_token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "30d" });
            const refresh_token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "30d" });
            return { access_token, refresh_token };
        };

        if (!user) {
            console.log(`[SCHOLARSHIP_TRACE]: Creating new user record for ${emailLower}`);
            user = await prismadb.user.create({
                data: {
                    name: fullName,
                    email: emailLower,
                    phone_number: phone_number,
                    password: hashedPassword,
                    emailVerified: new Date(),
                }
            });
        } else {
            console.log(`[SCHOLARSHIP_TRACE]: Updating existing user ${user.id} details.`);
            const updateData: any = {
                name: fullName,
                phone_number: phone_number,
            };
            if (hashedPassword) {
                updateData.password = hashedPassword;
            }
            user = await prismadb.user.update({
                where: { id: user.id },
                data: updateData
            });
        }

        // 3. Generate and save access token in ONE go if possible
        const { access_token, refresh_token } = generateTokens(user);
        user = await prismadb.user.update({
            where: { id: user.id },
            data: { access_token }
        });

        // 4. Scholarship Application (Create or Update)
        let application = await prismadb.scholarshipApplication.findFirst({
            where: { email: emailLower }
        });

        const appData = {
            fullName,
            phone_number,
            country,
            gender,
            program,
            cohort,
            discountCode,
            password: hashedPassword, // Store hashed password here too for redundancy/audit
            userId: user.id
        };

        if (application) {
            application = await prismadb.scholarshipApplication.update({
                where: { id: application.id },
                data: appData
            });
        } else {
            application = await prismadb.scholarshipApplication.create({
                data: { ...appData, email: emailLower, paymentStatus: "PENDING" }
            });
        }

        console.log(`[SCHOLARSHIP_TRACE]: Successfully completed registration for ${emailLower}. Password Saved: ${!!user.password}`);

        // Background tasks
        sendIWDRegistrationEmail(emailLower, fullName).catch(err => console.error("[SCHOLARSHIP_EMAIL_ERROR]:", err));

        import("../../utils/googleSheets").then(({ GoogleSheetsSyncService }) => {
            GoogleSheetsSyncService.syncApplication(application).catch(err => console.error("[GOOGLE_SHEETS_SYNC_ERROR]:", err));
        });

        return res.status(201).json({
            status: "success",
            message: "Scholarship application submitted successfully!",
            refresh_token,
            data: { ...user, access_token },
            application
        });
    } catch (error) {
        console.error("[SCHOLARSHIP_APPLY_CRITICAL_ERROR]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getScholarshipApplications(req: Request, res: Response) {
    try {
        const applications = await prismadb.scholarshipApplication.findMany({
            include: {
                user: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            status: "success",
            data: applications
        });
    } catch (error) {
        console.log("[GET_SCHOLARSHIP_APPLICATIONS]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function syncScholarshipToSheets(req: Request, res: Response) {
    try {
        const { GoogleSheetsSyncService } = await import("../../utils/googleSheets");
        const result = await GoogleSheetsSyncService.syncAllApplications();

        if (result.success) {
            return res.status(200).json({
                status: "success",
                message: `Successfully synced ${result.count} applications to Google Sheets.`
            });
        } else {
            return res.status(500).json({
                status: "error",
                message: "Failed to sync to Google Sheets",
                error: result.error
            });
        }
    } catch (error: any) {
        console.log("[SYNC_SCHOLARSHIP_TO_SHEETS]:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

