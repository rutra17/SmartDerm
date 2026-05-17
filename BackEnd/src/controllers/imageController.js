export const uploadImage = (req, res) => {
    // Verifica se algum arquivo chegou
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }

    // Se chegou, pegamos as informações básicas do arquivo
    const fileInfo = {
        nome: req.file.originalname,
        tipo: req.file.mimetype,
        tamanho: `${(req.file.size / 1024).toFixed(2)} KB`
    };

    console.log("📸 Nova imagem recebida no servidor:", fileInfo.nome);

    // Retorna sucesso para o Front-End
    res.status(200).json({
        message: 'Imagem recebida com sucesso pelo Back-End!',
        detalhes: fileInfo
    });
};