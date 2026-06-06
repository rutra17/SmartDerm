import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); // Aponta para o seu .env na raiz do BackEnd

async function descobrirModelos() {
    console.log("📡 Consultando os servidores do Google...");
    
    const chave = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${chave}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        console.log("\n✅ Modelos disponíveis para a sua chave que suportam visão/texto:");
        dados.models.forEach(m => {
            // Filtra para mostrar apenas os modelos que geram conteúdo
            if (m.supportedGenerationMethods.includes("generateContent")) {
                // Remove a palavra 'models/' do começo para facilitar a cópia
                const nomeLimpo = m.name.replace('models/', '');
                console.log(`- ${nomeLimpo}`);
            }
        });
    } catch (error) {
        console.error("Erro ao buscar modelos:", error);
    }
}

descobrirModelos();