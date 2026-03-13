import { GoogleSheetsSyncService } from './src/utils/googleSheets';

async function main() {
    console.log('--- Google Sheets Full Sync Test ---');
    try {
        await GoogleSheetsSyncService.syncAllApplications();
    } catch (error: any) {
        console.error('Test script caught error:', error.message);
    }
}

main();
