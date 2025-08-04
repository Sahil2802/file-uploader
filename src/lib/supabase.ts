import { createClient } from "@supabase/supabase-js";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

// Use placeholder values if not set (for development)
const defaultUrl = supabaseUrl || "https://placeholder.supabase.co";
const defaultKey = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(defaultUrl, defaultKey);
