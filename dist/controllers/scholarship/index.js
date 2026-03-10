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
            const salt = await bcryptjs_1.default.genSalt(10);
            hashedPassword = await bcryptjs_1.default.hash(rawPassword.trim(), salt);
            console.log(`[SCHOLARSHIP_TRACE]: Password hashed successfully for ${emailLower}`);
        }
        else {
            console.warn(`[SCHOLARSHIP_TRACE]: NO VALID PASSWORD detected for ${emailLower}.`);
        }
        // 2. User Handling (Create or Update)
        let user = await index_1.prismadb.user.findFirst({
            where: {
                OR: [
                    { email: emailLower },
                    { phone_number: phone_number }
                ]
            }
        });
        // Prepare standard tokens upfront
        const generateTokens = (u) => {
            const payload = { email: u.email, id: u.id, role: u.role };
            const access_token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
            const refresh_token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
            return { access_token, refresh_token };
        };
        if (!user) {
            console.log(`[SCHOLARSHIP_TRACE]: Creating new user record for ${emailLower}`);
            user = await index_1.prismadb.user.create({
                data: {
                    name: fullName,
                    email: emailLower,
                    phone_number: phone_number,
                    password: hashedPassword,
                    emailVerified: new Date(),
                }
            });
        }
        else {
            console.log(`[SCHOLARSHIP_TRACE]: Updating existing user ${user.id} details.`);
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
        }
        // 3. Generate and save access token in ONE go if possible
        const { access_token, refresh_token } = generateTokens(user);
        user = await index_1.prismadb.user.update({
            where: { id: user.id },
            data: { access_token }
        });
        // 4. Scholarship Application (Create or Update)
        let application = await index_1.prismadb.scholarshipApplication.findFirst({
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
            application = await index_1.prismadb.scholarshipApplication.update({
                where: { id: application.id },
                data: appData
            });
        }
        else {
            application = await index_1.prismadb.scholarshipApplication.create({
                data: { ...appData, email: emailLower, paymentStatus: "PENDING" }
            });
        }
        console.log(`[SCHOLARSHIP_TRACE]: Successfully completed registration for ${emailLower}. Password Saved: ${!!user.password}`);
        // Background tasks
        (0, mail_1.sendIWDRegistrationEmail)(emailLower, fullName).catch(err => console.error("[SCHOLARSHIP_EMAIL_ERROR]:", err));
        Promise.resolve().then(() => __importStar(require("../../utils/googleSheets"))).then(({ GoogleSheetsSyncService }) => {
            GoogleSheetsSyncService.syncApplication(application).catch(err => console.error("[GOOGLE_SHEETS_SYNC_ERROR]:", err));
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
        console.error("[SCHOLARSHIP_APPLY_CRITICAL_ERROR]:", error);
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