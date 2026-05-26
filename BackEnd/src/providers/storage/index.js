import { uploadImagemMinio, removerImagemMinio } from './minio.js';

export async function uploadImagem(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  return uploadImagemMinio(buffer, nomeArquivo, mimeType);
}

export async function removerImagem(caminho) {
  return removerImagemMinio(caminho);
}

export { uploadImagemMinio, removerImagemMinio } from './minio.js';
