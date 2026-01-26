import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Log environment status for debugging
console.log('🔧 Supabase Environment Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Found' : '❌ Missing');
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing');

// Validate required variables for main client
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Anon Key is missing. Please check your .env file.");
}

// Create main client (always needed)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create admin client only if service key exists
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : null;

// Helper function to check if admin is available
export const isAdminAvailable = () => {
  const available = !!supabaseAdmin;
  console.log('Admin client available:', available);
  return available;
};

// Test connection on import
(async () => {
  try {
    // Test regular client connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.warn('⚠️ Regular client auth test failed:', authError.message);
    } else {
      console.log('✅ Regular client connected successfully');
    }
    
    // Test admin client if available
    if (supabaseAdmin) {
      try {
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.getSession();
        
        if (adminError) {
          console.warn('⚠️ Admin client auth test failed:', adminError.message);
        } else {
          console.log('✅ Admin client connected successfully');
          
          // Test admin privileges by getting current user
          const { data: { user } } = await supabaseAdmin.auth.getUser();
          if (user) {
            console.log('👤 Admin client authenticated as:', user.email);
          }
        }
      } catch (adminTestError) {
        console.warn('⚠️ Admin client test error:', adminTestError.message);
      }
    } else {
      console.warn('⚠️ Admin client not available. Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env');
      console.warn('   Get it from: Supabase Dashboard → Settings → API → service_role key');
    }
  } catch (error) {
    console.error('❌ Initial connection test failed:', error.message);
  }
})();

// Export a function to get admin status
export const getAdminStatus = () => ({
  urlConfigured: !!supabaseUrl,
  anonKeyConfigured: !!supabaseKey,
  serviceKeyConfigured: !!supabaseServiceKey,
  adminAvailable: !!supabaseAdmin,
  supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
  adminClient: supabaseAdmin ? 'Available' : 'Not Available'
});