import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace these with your Supabase project URL and anon key
const supabaseUrl = "https://jdoqulhsmotuqinhdafd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkb3F1bGhzbW90dXFpbmhkYWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMjE1NjcsImV4cCI6MjA1NzU5NzU2N30.PVg3aR_JLtw65al2RG4nKM_oxuFA3QqibJnGgXCFdAo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
