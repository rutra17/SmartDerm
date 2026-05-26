import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis do ficheiro .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use a chave anónima padrão ou a Service Role Key (recomendado para Back-End)
const supabaseKey = process.env.SUPABASE_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ ERRO: Faltam as chaves SUPABASE_URL ou SUPABASE_KEY no ficheiro .env do Back-End!");
}

// Cria e exporta a conexão para o imageController usar
export const supabase = createClient(supabaseUrl, supabaseKey);