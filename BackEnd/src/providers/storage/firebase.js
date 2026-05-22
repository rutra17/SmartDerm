import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: BUCKET,
  });
}

export async function uploadImagemFirebase(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  try {
    getFirebaseApp();
    const caminho = \`lesoes/\${nomeArquivo}\`;
    const fileRef = getStorage().bucket().file(caminho);
    await fileRef.save(buffer, { metadata: { contentType: mimeType } });
    await fileRef.makePublic();
    return { url: \`https://storage.googleapis.com/\${BUCKET}/\${caminho}\`, caminho, erro: null };
  } catch (err) {
    return { url: null, caminho: null, erro: err.message };
  }
}

export async function removerImagemFirebase(caminho) {
  try {
    getFirebaseApp();
    await getStorage().bucket().file(caminho).delete();
    return { sucesso: true, erro: null };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}
