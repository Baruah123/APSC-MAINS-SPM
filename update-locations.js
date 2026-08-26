const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertLocations() {
  const locations = [
    { id: 'a440fc53-cdfe-4e1a-a969-d2ea9b54267b', name: 'Dibrugarh Center', city: 'Dibrugarh', capacity: 300 },
    { id: '11c779cf-f978-4b0b-95de-b042bff06007', name: 'Sibsagar Center', city: 'Sibsagar', capacity: 300 },
    { id: '301843ca-c372-4e10-811d-fcdc763978c8', name: 'Jorhat Center', city: 'Jorhat', capacity: 300 },
    { id: '4e324de0-d104-4ba9-8ded-220883f5d0ce', name: 'Guwahati Center', city: 'Guwahati', capacity: 500 },
    { id: 'abd06aa0-8366-47dd-8c07-16cc78831a8f', name: 'Tezpur Center', city: 'Tezpur', capacity: 300 },
    { id: '5cc8157a-6f78-48f0-bdc9-c03d140eb3a1', name: 'Nalbari Center', city: 'Nalbari', capacity: 300 },
    { id: 'd21e1bc4-6c40-4e43-9737-9235f476691e', name: 'Kokrajhar Center', city: 'Kokrajhar', capacity: 300 },
  ];

  console.log('Upserting test locations...');
  const { error } = await supabase
    .from('test_locations')
    .upsert(locations, { onConflict: 'id' });
    
  if (error) {
    console.error('Error inserting locations:', error);
  } else {
    console.log('Successfully inserted all 7 test locations!');
  }
}

insertLocations();
