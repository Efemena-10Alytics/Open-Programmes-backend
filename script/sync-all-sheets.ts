import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const SYNC_SECRET_KEY = process.env.SYNC_SECRET_KEY || 'sync_payment';

async function syncAllSheets() {
  try {
    console.log('🔄 Starting Google Sheets sync...\n');
    console.log('📍 Using BACKEND_URL:', BACKEND_URL);
    console.log('🔑 Using SYNC_SECRET_KEY:', SYNC_SECRET_KEY.substring(0, 5) + '...\n');

    // Sync IWD Applications
    console.log('📊 Syncing IWD Applications Sheet...');
    try {
      const iwd_response = await axios.get(
        `${BACKEND_URL}/api/scholarship/sync-public?key=${SYNC_SECRET_KEY}`
      );
      console.log(
        '✅ IWD Applications synced:',
        iwd_response.data.message || `${iwd_response.data.recordCount} records`
      );
    } catch (error: any) {
      console.error('❌ IWD sync failed:');
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Message:', error.response.data?.message || error.message);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('   No response received:', error.request);
      } else {
        console.error('   Error:', error.message);
        console.error('   Stack:', error.stack);
      }
    }

    console.log();

    // Sync Payment Data
    console.log('💳 Syncing Payment Data Sheet...');
    try {
      const payment_response = await axios.get(
        `${BACKEND_URL}/api/payment/sync-public?key=${SYNC_SECRET_KEY}`
      );
      console.log(
        '✅ Payment data synced:',
        payment_response.data.message || `${payment_response.data.recordCount} records`
      );
    } catch (error: any) {
      console.error('❌ Payment sync failed:');
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Message:', error.response.data?.message || error.message);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('   No response received:', error.request);
      } else {
        console.error('   Error:', error.message);
        console.error('   Stack:', error.stack);
      }
    }

    console.log('\n✨ Google Sheets sync completed!');
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

syncAllSheets();
