global.WebSocket = class {}; // Mock WebSocket to prevent error in node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cywccfxglanhketofhyw.supabase.co';
const supabaseAnonKey = 'sb_publishable_Bvk4aCHwE4V_LAaauYbEcg_OpxMh973';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

async function run() {
  const { data, error } = await supabase.from('bookings').select('*').limit(1);
  if (error) {
    console.error('Error fetching bookings:', error);
  } else {
    console.log('Bookings schema/keys:', data.length > 0 ? Object.keys(data[0]) : 'No records found');
    console.log('Sample data:', data[0]);
  }
}

run();
