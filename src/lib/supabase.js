import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  document.body.innerHTML = `
    <div style="font-family:sans-serif;max-width:480px;margin:60px auto;padding:24px;border:1px solid #f5c5cd;border-radius:12px;background:#fdf3f5">
      <h2 style="color:#8B1A2F;margin:0 0 8px">Configuration missing</h2>
      <p style="color:#555;margin:0">Supabase environment variables are not set.<br>
      Add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your Vercel project settings.</p>
    </div>`
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
