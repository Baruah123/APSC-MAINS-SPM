import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Resetting google_sync_status for all registrations...");

  const { data, error } = await supabase
    .from("registrations")
    .update({ google_sync_status: 'pending' })
    .not("id", "is", null)
    .select("id");

  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }

  console.log(
    `Successfully reset ${data?.length ?? 0} registration(s)!`
  );
}

main();
