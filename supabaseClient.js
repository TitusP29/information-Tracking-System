import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://lmtkufbdmwmguqvjhken.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdGt1ZmJkbXdtZ3Vxdmpoa2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjEzNzQsImV4cCI6MjA2NDM5NzM3NH0.EEGuPJVgby-5jaBNA4qsZD5BKmBJQzuRQfWmnN9JG5I';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  db: {
    schema: 'public'
  }
});

// Add debug logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', { event, session });
});

// Helper function to ensure headers are set for requests
const ensureHeaders = (query) => {
  return query.headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`
  });
};

// Add the helper function to the supabase object
supabase.ensureHeaders = ensureHeaders; 