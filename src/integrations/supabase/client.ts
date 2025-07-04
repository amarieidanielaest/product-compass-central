
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://spubjrvuggyrozoawofp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdWJqcnZ1Z2d5cm96b2F3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzM1NTYsImV4cCI6MjA2NzIwOTU1Nn0.X4f0Ouq6evWVNwXBkTjnSXqHiwf7rc6LlgWN9HodCxM'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
