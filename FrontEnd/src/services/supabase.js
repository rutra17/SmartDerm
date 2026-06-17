import { createClient } from '@supabase/supabase-js';

// Puxando as credenciais seguras do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializando e exportando a conexão
export const supabase = null;