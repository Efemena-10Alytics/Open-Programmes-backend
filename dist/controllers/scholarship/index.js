"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyForScholarship = applyForScholarship;
exports.getScholarshipApplications = getScholarshipApplications;
exports.syncScholarshipToSheets = syncScholarshipToSheets;
const index_1 = require("../../index");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mail_1 = require("./mail");
async function applyForScholarship(req, res) {
    try {
        const { fullName, email, phone_number, country, gender, program, cohort, discountCode, password } = req.body;
        if (!fullName || !email || !phone_number || !country || !gender || !program || !cohort) {
            return res.status(400).json({ message: "Fill in all required fields!" });
        }
        const emailLower = email ? email.trim().toLowerCase() : "";
        console.log(`[SCHOLARSHIP_TRACE]: Incoming for ${emailLower}. Keys in body: ${Object.keys(req.body).join(", ")}. Password present: ${!!req.body.password}`);
        // 1. Check if email already applied
        let application = await index_1.prismadb.scholarshipApplication.findFirst({
            where: { email: emailLower }
        });
        // 2. Hash password
        let hashedPassword = null;
        if (password && typeof password === 'string' && password.trim() !== "") {
            console.log(`[SCHOLARSHIP_TRACE]: Hashing password... Length: ${password.length}`);
            const salt = await bcryptjs_1.default.genSalt(10);
            hashedPassword = await bcryptjs_1.default.hash(password, salt);
            console.log(`[SCHOLARSHIP_TRACE]: Hashed result: ${hashedPassword ? hashedPassword.substring(0, 10) + "..." : "NULL"}`);
        }
        else {
            console.warn(`[SCHOLARSHIP_TRACE]: NO VALID PASSWORD received for ${emailLower}. Password type: ${typeof password}`);
        }
        // 3. User Handling
        let user = await index_1.prismadb.user.findFirst({
            where: {
                OR: [
                    { email: emailLower },
                    { phone_number: phone_number }
                ]
            }
        });
        if (!user) {
            console.log(`[SCHOLARSHIP_TRACE]: Creating NEW user for ${emailLower}.`);
            user = await index_1.prismadb.user.create({
                data: {
                    name: fullName,
                    email: emailLower,
                    phone_number: phone_number,
                    password: hashedPassword,
                    emailVerified: new Date(),
                }
            });
            console.log(`[SCHOLARSHIP_TRACE]: User created with ID: ${user.id}. Password saved: ${!!user.password}`);
        }
        else {
            console.log(`[SCHOLARSHIP_TRACE]: Found existing user ${user.id}. Syncing name, phone, and password.`);
            // Update user details even if they exist, making this application act like a profile update if they use a new password
            const updateData = {
                name: fullName,
                phone_number: phone_number,
            };
            if (hashedPassword) {
                updateData.password = hashedPassword;
            }
            user = await index_1.prismadb.user.update({
                where: { id: user.id },
                data: updateData
            });
            console.log(`[SCHOLARSHIP_TRACE]: User fields (name, phone, password) updated for ID: ${user.id}.`);
        }
        // 4. Scholarship Application (Create or Update)
        if (application) {
            console.log(`[SCHOLARSHIP_TRACE]: Updating existing application ${application.id}`);
            application = await index_1.prismadb.scholarshipApplication.update({
                where: { id: application.id },
                data: {
                    fullName,
                    phone_number,
                    country,
                    gender,
                    program,
                    cohort,
                    discountCode,
                    password: hashedPassword, // Always save the new password if provided
                    userId: user.id
                }
            });
        }
        else {
            console.log(`[SCHOLARSHIP_TRACE]: Creating new scholarship application record.`);
            application = await index_1.prismadb.scholarshipApplication.create({
                data: {
                    fullName,
                    email: emailLower,
                    phone_number,
                    country,
                    gender,
                    program,
                    cohort,
                    discountCode,
                    password: hashedPassword,
                    paymentStatus: "PENDING",
                    userId: user.id
                }
            });
        }
        console.log(`[SCHOLARSHIP_TRACE]: Scholarship application record ${application.id} ready. Password: ${!!application.password}`);
        // Send confirmation email in the background
        (0, mail_1.sendIWDRegistrationEmail)(emailLower, fullName).catch(err => {
            console.error("[SCHOLARSHIP_EMAIL_ERROR]:", err);
        });
        // Sync to Google Sheets in the background
        Promise.resolve().then(() => __importStar(require("../../utils/googleSheets"))).then(({ GoogleSheetsSyncService }) => {
            GoogleSheetsSyncService.syncApplication(application).catch(err => {
                console.error("[GOOGLE_SHEETS_SYNC_ERROR]:", err);
            });
        });
        // Generate tokens so user is logged in for the next step
        const access_token = jsonwebtoken_1.default.sign({
            email: user.email,
            id: user.id,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "30d" });
        const refresh_token = jsonwebtoken_1.default.sign({
            email: user.email,
            id: user.id,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "30d" });
        await index_1.prismadb.user.update({
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
    }
    catch (error) {
        console.log("[SCHOLARSHIP_APPLY]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
async function getScholarshipApplications(req, res) {
    try {
        const applications = await index_1.prismadb.scholarshipApplication.findMany({
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
    }
    catch (error) {
        console.log("[GET_SCHOLARSHIP_APPLICATIONS]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
async function syncScholarshipToSheets(req, res) {
    try {
        const { GoogleSheetsSyncService } = await Promise.resolve().then(() => __importStar(require("../../utils/googleSheets")));
        const result = await GoogleSheetsSyncService.syncAllApplications();
        if (result.success) {
            return res.status(200).json({
                status: "success",
                message: `Successfully synced ${result.count} applications to Google Sheets.`
            });
        }
        else {
            return res.status(500).json({
                status: "error",
                message: "Failed to sync to Google Sheets",
                error: result.error
            });
        }
    }
    catch (error) {
        console.log("[SYNC_SCHOLARSHIP_TO_SHEETS]:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
//# sourceMappingURL=index.js.map