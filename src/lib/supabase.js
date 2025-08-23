import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("🔧 Supabase URL:", supabaseUrl);
console.log("🔧 Supabase Key length:", supabaseAnonKey?.length);
console.log("🔧 Key starts with:", supabaseAnonKey?.substring(0, 50));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
}

// Create client with minimal configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
