import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'pedro.veloso@live.com';
  const password = 'aqt@1542';

  const { data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const { data, error } = await supabase.from('letters').select('*');
  console.log(data, error);
}

run();
