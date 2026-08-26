const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Poor man's dotenv
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

const csv = fs.readFileSync('APSC CCE 2025 Prelims Cleared Names and Roll Number.csv', 'utf8');
const lines = csv.split('\n').filter(line => line.trim());

const candidates = lines.map(line => {
  const [roll_number, ...nameParts] = line.split(',');
  return {
    roll_number: roll_number.trim(),
    candidate_name: nameParts.join(',').trim()
  };
});

async function upload() {
  console.log('Uploading candidates...');
  
  const batchSize = 1000;
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const { error } = await supabase
      .from('apsc_candidates')
      .upsert(batch, { onConflict: 'roll_number', ignoreDuplicates: true });
      
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Uploaded batch of ' + batch.length);
    }
  }
  console.log('Done!');
}
upload();
