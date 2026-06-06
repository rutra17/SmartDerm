import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true' ? true : false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET;

/**
 * Gera um nome de arquivo único no formato: laudos/{timestamp}-{uuid-curto}.{extensao}
 * @param {string} mimeType
 * @returns {string}
 */
export function gerarNomeArquivo(mimeType) {
    const extensoes = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
    };
    const ext = extensoes[mimeType] || 'bin';
    const timestamp = Date.now();
    const uuidCurto = Math.random().toString(36).substring(2, 10);
    return `laudos/${timestamp}-${uuidCurto}.${ext}`;
}

/**
 * Garante que o bucket existe, criando se necessário.
 * @param {string} nomeBucket
 * @returns {Promise<void>}
 */
export async function garantirBucket(nomeBucket) {
    try {
        const existe = await minioClient.bucketExists(nomeBucket);
        if (!existe) {
            await minioClient.makeBucket(nomeBucket);
            console.log(`📦 Bucket '${nomeBucket}' criado com sucesso.`);
        }
    } catch (error) {
        console.error('❌ Erro ao garantir bucket MinIO:', error);
        throw error;
    }
}

/**
 * Faz upload de um buffer para o MinIO e retorna a URL pública do arquivo.
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @param {string} nomeArquivo
 * @returns {Promise<string>}
 */
export async function uploadImagem(buffer, mimeType, nomeArquivo) {
    try {
        await garantirBucket(BUCKET);

        await minioClient.putObject(BUCKET, nomeArquivo, buffer, buffer.length, {
            'Content-Type': mimeType,
        });

        const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET}/${nomeArquivo}`;
        console.log(`📤 Imagem enviada para o MinIO: ${url}`);
        return url;
    } catch (error) {
        console.error('❌ Erro ao fazer upload para o MinIO:', error);
        throw error;
    }
}
