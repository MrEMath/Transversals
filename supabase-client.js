// supabase-client.js

const SUPABASE_URL = "https://xsmhhduixpyotdhsjizr.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE"; // paste anon key here

// IMPORTANT: declare supabase only once, here
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
