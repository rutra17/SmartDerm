import * as Minio from 'minio';
import { randomUUID } from 'crypto';

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET = process.env.MINIO_BUCKET || 'smartderm';
const PUBLIC_ENDPOINT = process.env.MINIO_PUBLIC_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';

const garantirBucket = async () => {
    const existe = await minioClient.bucketExists(BUCKET);
    if (!existe) {
        await minioClient.makeBucket(BUCKET, 'us-east-1');
        const policy = JSON.stringify({
            Version: '2012-10-17',
            Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
        });
        await minioClient.setBucketPolicy(BUCKET, policy);
    }
};

export const gerarNomeArquivo = (mimeType) => {
    const ext = mimeType.split('/')[1] || 'jpg';
    return `${randomUUID()}.${ext}`;
};

export const uploadImagem = async (buffer, mimeType, nomeArquivo) => {
    await garantirBucket();
    await minioClient.putObject(BUCKET, nomeArquivo, buffer, buffer.length, { 'Content-Type': mimeType });
    return `http://${PUBLIC_ENDPOINT}:${MINIO_PORT}/${BUCKET}/${nomeArquivo}`;
};
