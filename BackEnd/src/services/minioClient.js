import * as Minio from 'minio';
import 'dotenv/config';

// Cria a ligação com o contentor do MinIO que está a rodar no seu Docker
export const minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,      
    secretKey: process.env.MINIO_ROOT_PASSWORD   
});

const bucketName = 'imagens-medicas';

// Função que arranca sozinha para garantir que o "cofre" (Bucket) existe
async function inicializarMinio() {
    try {
        const existe = await minioClient.bucketExists(bucketName);
        if (!existe) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`📦 Bucket '${bucketName}' criado com sucesso no MinIO!`);
            
            // Define uma política para permitir que o Front-End veja as imagens geradas
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: ['s3:GetObject'],
                        Effect: 'Allow',
                        Principal: '*',
                        Resource: [`arn:aws:s3:::${bucketName}/*`]
                    }
                ]
            };
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log("🔓 Política pública de leitura aplicada ao bucket.");
        } else {
            console.log(`📦 Bucket '${bucketName}' já está pronto no MinIO.`);
        }
    } catch (error) {
        console.error("❌ Erro ao conectar/criar bucket no MinIO:", error);
    }
}

inicializarMinio();