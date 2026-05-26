import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oendxvxdevqhpoagqohs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbmR4dnhkZXZxaHBvYWdxb2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDI4MzcsImV4cCI6MjA5NDI3ODgzN30.pLR5D2kwh0A3bzPtcqNX7wJDT0zTzXWvt1bdZHbWnu8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);