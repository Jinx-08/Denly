const {createClient} = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabaseAuth;