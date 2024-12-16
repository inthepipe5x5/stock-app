import { createClient } from "@supabase/supabase-js";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";

const supabase = createClient(
  process.env.SUPABASE_API_URL, //url to access supabase
  process.env.SUPABASE_SERVICE_KEY, //service key to bypass RLS security
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

export {supabase.auth.admin: Auth};
export default supabase;
