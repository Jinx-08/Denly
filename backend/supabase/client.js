const {createClient} = require('@supabase/supabase-js');
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceRoleKey) {
    throw new Error('Missing Supabase Service Role Key in environment variables');
}   
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
    throw new Error('Missing Supabase URL in environment variables');
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;