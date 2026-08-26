const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log("Fetching a row to see what columns exist...");
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data columns:", data && data.length > 0 ? Object.keys(data[0]) : "No rows");
  }
}

test();
