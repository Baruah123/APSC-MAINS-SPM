const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log("Attempting a dummy insert...");
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      registration_id: 'TEST-123',
      mobile_number: '1234567890',
      mobile_verified: true,
      roll_number: '1234567',
      candidate_name: 'Test',
      email: 'test@example.com',
      photo_storage_path: 'test',
      mock_test_mode: 'offline',
      preferred_location: null,
      second_preferred_location: null,
      acceptance: true
    })
    .select('id');
    
  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success, deleting...");
    await supabase.from('registrations').delete().eq('registration_id', 'TEST-123');
  }
}

test();
