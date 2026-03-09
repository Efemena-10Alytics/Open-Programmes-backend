import { GoogleSheetsSyncService } from './src/utils/googleSheets';

async function main() {
    console.log('--- Google Sheets Connection Test ---');
    try {
        await GoogleSheetsSyncService.testConnection();
    } catch (error: any) {
        console.error('Test script caught error:', error.message);
    }
}

main();
