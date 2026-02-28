import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log("Products query error:", error);
  const { data: q2, error: e2 } = await supabase.from('clients').select('*').limit(1);
  console.log("Clients query error:", e2);
}
check();
