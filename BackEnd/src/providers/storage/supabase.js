import { createClient } from '@supabase/supabase-js';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'smartderm-imagens';

function getClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function uploadImagemSupabase(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  const supabase = getClient();
  const caminho  = \`lesoes/\${nomeArquivo}\`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, buffer, { contentType: mimeType, upsert: false });
  if (error) return { url: null, caminho: null, erro: error.message };
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return { url: urlData.publicUrl, caminho, erro: null };
}

export async function removerImagemSupabase(caminho) {
  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).remove([caminho]);
  return { sucesso: !error, erro: error?.message ?? null };
}
