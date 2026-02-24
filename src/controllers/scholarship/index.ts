import { Request, Response } from "express";
import { prismadb } from "../../../src/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function applyForScholarship(req: Request, res: Response) {
    try {
        const { fullName, email, phone_number, password, country, gender, program, cohort, discountCode } = req.body;

        if (!fullName || !email || !phone_number || !password || !country || !gender || !program || !cohort) {
            return res.status(400).json({ message: "Fill in all required fields!" });
        }

        const emailLower = email.toLowerCase();

        // Check if user already exists
        let user = await prismadb.user.findUnique({
            where: { email: emailLower }
        });

        if (user) {
            // If user exists, we might want to check if they already have an application
            const existingApplication = await prismadb.scholarshipApplication.findFirst({
                where: {
                    userId: user.id,
                    program: program
                }
            });

            if (existingApplication) {
                return res.status(400).json({ message: "You have already applied for this program scholarship." });
            }
        } else {
            // Create user if not exists
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await prismadb.user.create({
                data: {
                    name: fullName,
                    email: emailLower,
                    password: hashedPassword,
                    phone_number: phone_number,
                    emailVerified: new Date(),
                },
            });
        }

        // Create scholarship application
        const application = await prismadb.scholarshipApplication.create({
            data: {
                fullName,
                email: emailLower,
                phone_number,
                country,
                gender,
                program,
                cohort,
                discountCode,
                userId: user.id
            }
        });

        // Generate tokens so user is logged in
        const access_token = jwt.sign(
            {
                email: user.email,
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "30d" }
        );

        const refresh_token = jwt.sign(
            {
                email: user.email,
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "30d" }
        );

        await prismadb.user.update({
            where: { id: user.id },
            data: { access_token }
        });

        return res.status(201).json({
            status: "success",
            message: "Scholarship application submitted successfully!",
            refresh_token,
            data: { ...user, access_token },
            application
        });
    } catch (error) {
        console.log("[SCHOLARSHIP_APPLY]:", error);
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
