// BackEnd/src/routes/convites.routes.js
const express = require('express');
const router = express.Router();
// Importe aqui o seu controller ou pool do banco correspondente do projeto

// Rota para buscar todos os convites ativos
router.get('/admin/convites', async (req, res) => {
    // Sua lógica de SELECT * FROM codigos_convite
});

// Rota para gerar um novo convite
router.post('/admin/convites', async (req, res) => {
    // Sua lógica de INSERT INTO codigos_convite
});

module.exports = router;
