import { Client } from 'minio';

const BUCKET = process.env.MINIO_BUCKET || 'smartderm-imagens';

function getClient() {
  return new Client({
    endPoint:  process.env.MINIO_ENDPOINT || 'minio',
    port:      parseInt(process.env.MINIO_PORT || '9000'),
    useSSL:    process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });
}

async function garantirBucket(client) {
  const existe = await client.bucketExists(BUCKET);
  if (!existe) await client.makeBucket(BUCKET);
}

export async function uploadImagemMinio(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  try {
    const client  = getClient();
    await garantirBucket(client);
    const caminho = `lesoes/${nomeArquivo}`;
    await client.putObject(BUCKET, caminho, buffer, buffer.length, { 'Content-Type': mimeType });
    const endpoint = process.env.MINIO_ENDPOINT || 'minio';
    const port     = process.env.MINIO_PORT || '9000';
    const url      = `http://${endpoint}:${port}/${BUCKET}/${caminho}`;
    return { url, caminho, erro: null };
  } catch (err) {
    return { url: null, caminho: null, erro: err.message };
  }
}

export async function removerImagemMinio(caminho) {
  try {
    const client = getClient();
    await client.removeObject(BUCKET, caminho);
    return { sucesso: true, erro: null };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}
