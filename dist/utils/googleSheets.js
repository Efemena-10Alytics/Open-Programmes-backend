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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsSyncService = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const dotenv = __importStar(require("dotenv"));
const prismadb_1 = require("../lib/prismadb");
dotenv.config();
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
/**
 * Service to sync scholarship applications directly with Google Sheets.
 */
class GoogleSheetsSyncService {
    /**
     * Initialize Google Auth using Service Account credentials.
     * Supports both raw JSON string and Base64 encoded JSON.
     */
    static getAuth() {
        if (this.auth)
            return this.auth;
        const configJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (!configJson) {
            console.error('[GOOGLE_SHEETS_SYNC]: GOOGLE_SERVICE_ACCOUNT_JSON is missing in .env');
            throw new Error('Google Sheets credentials missing');
        }
        try {
            let credentials;
            // Try to parse as raw JSON first
            if (configJson.trim().startsWith('{')) {
                credentials = JSON.parse(configJson);
            }
            else {
                // Otherwise assume it's Base64 (like in your other project)
                const decodedJson = Buffer.from(configJson, 'base64').toString('utf8');
                credentials = JSON.parse(decodedJson);
            }
            this.auth = new google_auth_library_1.JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: SCOPES,
            });
            console.log('[GOOGLE_SHEETS_SYNC]: Auth initialized for client_email:', credentials.client_email);
            return this.auth;
        }
        catch (error) {
            console.error('[GOOGLE_SHEETS_SYNC]: Authentication setup failed:', error.message);
            throw new Error('Invalid Google Sheets credentials');
        }
    }
    /**
     * Re-syncs all applications from the database to the Google Sheet.
     * This checks real-time payment status from both ScholarshipApplication and the main PaymentStatus tables.
     */
    static async syncAllApplications() {
        console.log('[GOOGLE_SHEETS_SYNC]: Starting comprehensive sync...');
        try {
            const spreadsheetId = process.env.GOOGLE_SHEETS_IWD_2026_SPREADSHEET_ID;
            const range = process.env.GOOGLE_SHEETS_IWD_2026_RANGE || 'Sheet1!A1';
            if (!spreadsheetId) {
                console.warn('[GOOGLE_SHEETS_SYNC]: SPREADSHEET_ID not configured for full sync.');
                return { success: false, error: 'Spreadsheet ID missing' };
            }
            // Fetch all applications with their associated users and main payment records
            const applications = await prismadb_1.prismadb.scholarshipApplication.findMany({
                include: {
                    user: {
                        include: {
                            paymentStatus: {
                                include: {
                                    cohort: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            if (applications.length === 0) {
                console.log('[GOOGLE_SHEETS_SYNC]: No applications found in DB to sync.');
                return { success: true, count: 0 };
            }
            const auth = this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
            // 1. Clear the sheet first for a clean export
            try {
                await sheets.spreadsheets.values.clear({
                    spreadsheetId,
                    range,
                    requestBody: {}
                });
            }
            catch (clearErr) {
                console.warn('[GOOGLE_SHEETS_SYNC]: Clear failed:', clearErr.message);
            }
            // 2. Prepare Header and Data
            const header = [
                'Full Name',
                'Email',
                'Phone',
                'Country',
                'Gender',
                'Program',
                'Selected Cohort',
                'Discount Code',
                'Payment Status (IWD)',
                'Paid Cohort',
                'Submitted At'
            ];
            const rows = applications.map(app => {
                let realStatus = app.paymentStatus || 'PENDING';
                let paidCohort = 'N/A';
                // Verification Logic:
                // 1. If app is marked PAID, we trust it.
                // 2. If PENDING, check User's Account Status or PaymentStatus table
                if (realStatus !== 'PAID' && app.user) {
                    // Check if they have a COMPLETE payment status for the IWD cohorts
                    const iwdPaidStatus = app.user.paymentStatus.find(ps => ps.status === 'COMPLETE' &&
                        (ps.cohort?.name?.includes('April 2026') || ps.cohort?.name?.includes('May 2026')));
                    if (iwdPaidStatus || app.user.accountPaymentStatus === 'PAID') {
                        realStatus = 'PAID';
                        paidCohort = iwdPaidStatus?.cohort?.name || 'IWD Cohort';
                    }
                }
                return [
                    app.fullName,
                    app.email,
                    app.phone_number,
                    app.country,
                    app.gender,
                    app.program,
                    app.cohort,
                    app.discountCode || 'IWD 2026',
                    realStatus,
                    paidCohort,
                    new Date(app.createdAt).toLocaleString('en-GB')
                ];
            });
            const values = [header, ...rows];
            // 3. Write all data
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                requestBody: { values },
            });
            console.log(`[GOOGLE_SHEETS_SYNC]: Full sync completed. ${applications.length} applications exported.`);
            return { success: true, count: applications.length };
        }
        catch (error) {
            console.error('[GOOGLE_SHEETS_SYNC]: Full sync failed:', error.message);
            return { success: false, error: error.message };
        }
    }
    /**
     * Appends a scholarship application to the Google Sheet.
     */
    static async syncApplication(application) {
        try {
            const spreadsheetId = process.env.GOOGLE_SHEETS_IWD_2026_SPREADSHEET_ID;
            const range = process.env.GOOGLE_SHEETS_IWD_2026_RANGE || 'Sheet1!A1';
            if (!spreadsheetId) {
                console.warn('[GOOGLE_SHEETS_SYNC]: SPREADSHEET_ID not configured.');
                return;
            }
            const auth = this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
            // Prepare row data
            const values = [
                [
                    application.fullName,
                    application.email,
                    application.phone_number,
                    application.country,
                    application.gender,
                    application.program,
                    application.cohort,
                    application.discountCode || 'IWD 2026',
                    application.paymentStatus || 'PENDING',
                    new Date(application.createdAt || Date.now()).toLocaleString('en-GB')
                ],
            ];
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                requestBody: { values },
            });
            console.log(`[GOOGLE_SHEETS_SYNC]: Data successfully sent to sheet for ${application.email}`);
        }
        catch (error) {
            console.error('[GOOGLE_SHEETS_SYNC]: Sync failed with entry:', application.email);
            console.error('[GOOGLE_SHEETS_SYNC]: Error detail:', error.message);
            if (error.message.includes('403')) {
                console.error('[GOOGLE_SHEETS_SYNC]: TIP: Ensure you shared the sheet with Editor permissions to the Service Account email.');
            }
            if (error.message.includes('404')) {
                console.error('[GOOGLE_SHEETS_SYNC]: TIP: Verify the Spreadsheet ID in your .env is correct.');
            }
        }
    }
    /**
     * Run a test sync to verify connection.
     */
    static async testConnection() {
        console.log('[GOOGLE_SHEETS_SYNC]: Running connection test...');
        await this.syncApplication({
            fullName: 'Test Connection',
            email: 'test@example.com',
            phone_number: '0000000000',
            country: 'Test',
            gender: 'N/A',
            program: 'Test Connection',
            cohort: 'Test',
            discountCode: 'TEST',
            createdAt: new Date()
        });
    }
    /**
     * Syncs all payment data to Google Sheets.
     * Exports all fields from PaymentStatus (except IDs), followed by related names/prices,
     * and a calculated Amount Paid field.
     */
    static async syncPaymentData() {
        console.log('[GOOGLE_SHEETS_PAYMENTS]: Starting payment data sync...');
        try {
            const spreadsheetId = process.env.GOOGLE_SHEETS_PAYMENTS_SPREADSHEET_ID;
            const sheetName = 'Sheet1'; // Using the full sheet name to clear everything
            if (!spreadsheetId) {
                console.warn('[GOOGLE_SHEETS_PAYMENTS]: SPREADSHEET_ID not configured.');
                return { success: false, error: 'Spreadsheet ID missing' };
            }
            // Fetch all PaymentStatus records with expanded relations
            const paymentStatuses = await prismadb_1.prismadb.paymentStatus.findMany({
                include: {
                    user: true,
                    course: true,
                    cohort: true
                },
                orderBy: { createdAt: 'desc' }
            });
            if (paymentStatuses.length === 0) {
                console.log('[GOOGLE_SHEETS_PAYMENTS]: No payment data found in DB to sync.');
                return { success: true, count: 0 };
            }
            const auth = this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
            // 1. Clear the ENTIRE sheet first to remove any old columns/data
            try {
                await sheets.spreadsheets.values.clear({
                    spreadsheetId,
                    range: sheetName,
                    requestBody: {}
                });
            }
            catch (clearErr) {
                console.warn('[GOOGLE_SHEETS_PAYMENTS]: Clear failed:', clearErr.message);
            }
            // 2. Prepare Headers (Strict Order as requested)
            const header = [
                'User Name',
                'User Email',
                'Course Name',
                'Cohort Name',
                'Course Price',
                'Status',
                'Payment Plan',
                'Second Payment Due Date',
                'Amount Paid',
                'Created At',
                'Updated At'
            ];
            // 3. Prepare Data Rows
            const rows = paymentStatuses.map(ps => {
                const coursePriceNum = this.parseCoursePrice(ps.course?.price);
                let amountPaid = 0;
                if (ps.status === 'COMPLETE') {
                    amountPaid = coursePriceNum;
                }
                else if (ps.status === 'BALANCE_HALF_PAYMENT') {
                    amountPaid = Math.ceil(coursePriceNum / 2);
                }
                else {
                    amountPaid = 0;
                }
                return [
                    ps.user?.name || 'N/A',
                    ps.user?.email || 'N/A',
                    ps.course?.title || 'N/A',
                    ps.cohort?.name || 'N/A',
                    ps.course?.price || 'N/A',
                    ps.status,
                    ps.paymentPlan || 'N/A',
                    ps.secondPaymentDueDate ? new Date(ps.secondPaymentDueDate).toLocaleDateString('en-GB') : 'N/A',
                    amountPaid,
                    new Date(ps.createdAt).toLocaleString('en-GB'),
                    new Date(ps.updatedAt).toLocaleString('en-GB')
                ];
            });
            const values = [header, ...rows];
            // 4. Write data to Sheet starting at A1
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });
            console.log(`[GOOGLE_SHEETS_PAYMENTS]: Sync successful. ${paymentStatuses.length} records exported.`);
            return { success: true, count: paymentStatuses.length };
        }
        catch (error) {
            console.error('[GOOGLE_SHEETS_PAYMENTS]: Sync failed:', error.message);
            return { success: false, error: error.message };
        }
    }
    /**
     * Robust price parser to handle strings like "100k", "250,000", etc.
     */
    static parseCoursePrice(priceStr) {
        if (!priceStr)
            return 250000; // Default fallback
        let cleaned = String(priceStr).replace(/,/g, '').trim().toLowerCase();
        let multiplier = 1;
        if (cleaned.endsWith('k')) {
            multiplier = 1000;
            cleaned = cleaned.slice(0, -1);
        }
        const parsed = Number(cleaned);
        return isNaN(parsed) ? 250000 : Math.ceil(parsed * multiplier);
    }
}
exports.GoogleSheetsSyncService = GoogleSheetsSyncService;
GoogleSheetsSyncService.auth = null;
//# sourceMappingURL=googleSheets.js.map