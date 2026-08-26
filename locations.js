const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^[\"']|[\"']$/g, '');
});

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function insertLocations() {
  const locations = [
    { id: 'a3c1e3d3-7d22-4541-b8d9-2f22b7a8a1a3', name: 'Guwahati Center', city: 'Guwahati', capacity: 500 },
    { id: 'b4e2f4a5-8e33-4652-c9e0-3f33c8b9b2b4', name: 'Dibrugarh Center', city: 'Dibrugarh', capacity: 300 },
    { id: 'c5f3a5b6-9f44-4763-daf1-4f44d9cac3c5', name: 'Jorhat Center', city: 'Jorhat', capacity: 400 },
    { id: 'd6a4b6c7-0a55-4874-ebf2-5f55eadbd4d6', name: 'Silchar Center', city: 'Silchar', capacity: 300 }
  ];

  console.log('Inserting test locations...');
  const { error } = await supabase
    .from('test_locations')
    .upsert(locations, { onConflict: 'id' });
    
  if (error) {
    console.error('Error inserting locations:', error);
  } else {
    console.log('Successfully inserted test locations.');
  }
}

insertLocations();
