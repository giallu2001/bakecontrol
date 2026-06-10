import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ciqpnmbuzwbumelyrhye.supabase.co'

const supabaseKey = 'sb_publishable_E9hZCBYokSExw_O2vN-EZA_MbEnbNIY'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)