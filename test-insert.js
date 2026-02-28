import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // Since anon can't read schemas easily without rpc, let's just do a failing insert with a dummy UUID to see the error.
    const { data, error } = await supabase
        .from('products')
        .insert([{ profile_id: '02856c95-0a2b-402a-8602-84faee01190e', description: 'test', default_price: 10, default_vat_rate: 21 }]);
    console.log("Insert Error:", error);
}
test();
