// Função para enviar a imagem física para o Back-End (Node.js)
export const uploadImageToBackend = async (imageFile) => {
    // Usamos o FormData para simular o envio de um formulário com arquivo
    const formData = new FormData();
    formData.append('imagem', imageFile); // 'imagem' é o nome exato que o multer espera no Back-End

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro de comunicação com o Back-End:", error);
        throw error;
    }
};