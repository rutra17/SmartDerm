export const uploadImageToBackend = async (imageFile, userText, selectedAI, selectedPrompt, consultaId) => {
    const formData = new FormData();
    formData.append('imagem', imageFile);
    formData.append('userText', userText || '');
    formData.append('aiModel', selectedAI);
    formData.append('promptKey', selectedPrompt);
    formData.append('consultaId', consultaId);

    const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
    });
    return await response.json();
};