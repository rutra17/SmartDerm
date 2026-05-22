import { uploadImagemSupabase, removerImagemSupabase } from './supabase.js';
import { uploadImagemFirebase, removerImagemFirebase } from './firebase.js';

const PROVIDER = process.env.STORAGE_PROVIDER || 'supabase';

export async function uploadImagem(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  if (PROVIDER === 'firebase') return uploadImagemFirebase(buffer, nomeArquivo, mimeType);
  return uploadImagemSupabase(buffer, nomeArquivo, mimeType);
}

export async function removerImagem(caminho) {
  if (PROVIDER === 'firebase') return removerImagemFirebase(caminho);
  return removerImagemSupabase(caminho);
}

export { uploadImagemSupabase, removerImagemSupabase } from './supabase.js';
export { uploadImagemFirebase, removerImagemFirebase } from './firebase.js';
