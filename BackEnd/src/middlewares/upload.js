import multer from 'multer';

// o multer para guardar o arquivo na memória
const storage = multer.memoryStorage();

// o middleware que aceita apenas um arquivo chamado 'imagem'
export const uploadMiddleware = multer({ storage: storage }).single('imagem');