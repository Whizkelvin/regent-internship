import { createClient } from '@supabase/supabase-js';

// Replace these with your actual credentials from Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure both values exist
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Anon Key is missing. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
