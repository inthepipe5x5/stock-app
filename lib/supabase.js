import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_API_URL, //url to access supabase
  process.env.SUPABASE_SERVICE_KEY, //service key to bypass RLS security
  {
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_KEY,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },

  }

);

export default supabase;
