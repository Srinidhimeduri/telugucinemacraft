import { createClient } from '@supabase/supabase-js';

// Replace these values with your actual URL and Publishable Key from Supabase Dashboard -> Project Settings -> API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_PUBLISHABLE_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);