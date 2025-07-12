import { createClient } from '@supabase/supabase-js'

// Pobierz zmienne środowiskowe
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Utwórz i wyeksportuj klienta Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)