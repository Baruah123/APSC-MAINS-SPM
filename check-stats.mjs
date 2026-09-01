import { createClient } from '@supabase/supabase-js';

const url = 'https://pvmybuaouuopifarrpgh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bXlidWFvdXVvcGlmYXJycGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY3Mjc4NCwiZXhwIjoyMTAzMjQ4Nzg0fQ.9fHtxYqfelJyj9Ojt7CwIQYHLwmqZrf1JPI1alKQLXU';

const supabase = createClient(url, key);

async function check() {
  const { count: total } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
  const { count: online } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('mock_test_mode', 'online');
  const { count: offline } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('mock_test_mode', 'offline');
  const { count: completed } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'completed');
  
  console.log(JSON.stringify({ total, online, offline, completed }, null, 2));
}

check();
