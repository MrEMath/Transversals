// supabase-client.js

const SUPABASE_URL = "https://xsmhhduixpyotdhsjizr.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";  // from Supabase Settings → API

// v2 SDK: create client from global supabase namespace
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
