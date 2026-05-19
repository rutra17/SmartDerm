import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import SkeletonLoader from './components/SkeletonLoader';
import { supabase } from './services/supabase';
import { uploadImageToBackend } from './services/api';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [selectedAI, setSelectedAI] = useState('gemini');
    const [selectedPrompt, setSelectedPrompt] = useState('padrao');
    const [consultaId, setConsultaId] = useState(null); 
    const [imageFile, setImageFile] = useState(null); 
    
    // NOVOS ESTADOS PARA O HISTÓRICO E MODAL
    const [history, setHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientName, setPatientName] = useState('');

    const scrollRef = useRef(null);
    const fileRef = useRef(null);

    // Rola para o final automaticamente
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Carrega o histórico de consultas ao abrir a aplicação
    useEffect(() => {
        carregarHistorico();
    }, []);

    const carregarHistorico = async () => {
        console.log("📡 Buscando histórico no Supabase...");
        
        // Removemos o .order('created_at') para testar se o erro era a coluna inexistente
        const { data, error } = await supabase
            .from('consultas')
            .select('*');

        if (error) {
            console.error("❌ Erro ao buscar histórico:", error);
        }

        if (data) {
            console.log("✅ Histórico encontrado:", data);
            
            // Inverte a ordem no próprio JavaScript para o mais recente ficar no topo
            const historicoInvertido = data.reverse(); 
            setHistory(historicoInvertido);
        }
    };

    // Função para criar a nova consulta via Modal
    const iniciarNovaConsulta = async (e) => {
        e.preventDefault();
        if (!patientName.trim()) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('consultas')
            .insert([{ nome_paciente: patientName }])
            .select()
            .single();

        if (!error) {
            setConsultaId(data.id);
            setMessages([
                { id: Date.now(), role: 'assistant', text: `Nova triagem iniciada para o paciente **${patientName}**. Por favor, anexe a imagem da lesão.`, image: null }
            ]);
            setPatientName('');
            setIsModalOpen(false); // Fecha o modal
            carregarHistorico(); // Atualiza a barra lateral
        }
        setLoading(false);
    };

    // Função para carregar uma conversa antiga ao clicar na barra lateral
    const selecionarConsultaAntiga = async (id) => {
        console.log(`📡 Buscando mensagens para a consulta ID: ${id}...`);
        
        setConsultaId(id);
        setMessages([]); // Limpa a tela atual
        setLoading(true); // Mostra o carregamento

        // Removemos o .order('created_at') pelo mesmo motivo da barra lateral
        const { data, error } = await supabase
            .from('mensagens')
            .select('*')
            .eq('consulta_id', id);

        if (error) {
            console.error("❌ Erro ao buscar as mensagens do chat:", error);
            setLoading(false);
            return;
        }

        if (data) {
            console.log("✅ Mensagens encontradas no banco:", data);
            
            // Ordenamos diretamente no JavaScript (garantindo que a mais antiga fique no topo)
            // Se o ID for um número sequencial, isso garante a ordem correta da conversa
            const mensagensOrdenadas = data.sort((a, b) => a.id - b.id);

            // Formata os dados brutos do banco para o padrão visual que o React espera
            const mensagensFormatadas = mensagensOrdenadas.map(msg => ({
                id: msg.id,
                role: msg.role,
                text: msg.texto,
                image: msg.imagem_url
            }));
            
            setMessages(mensagensFormatadas);
        }
        setLoading(false);
    };

    const handleSend = async (e, previewUrl = null) => {
        e.preventDefault();
        
        if (!input.trim() && !previewUrl) return;
        
        if (!consultaId) {
            alert("Por favor, inicie uma nova consulta primeiro!");
            return;
        }
        
        const textToSend = input.trim() ? input : "Imagem enviada para triagem.";
        const newMsg = { id: Date.now(), role: 'user', text: textToSend, image: previewUrl };
        
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        let urlFinalDaImagem = null;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            // 1. Faz o upload físico da foto para o Storage do Supabase
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('imagens-medicas')
                .upload(fileName, imageFile);

            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                    .from('imagens-medicas')
                    .getPublicUrl(fileName);
                
                urlFinalDaImagem = publicUrlData.publicUrl;

                // 2. Grava o texto e o link da imagem do USUÁRIO no banco de dados
                await supabase.from('mensagens').insert([{
                    consulta_id: consultaId,
                    role: 'user',
                    texto: textToSend,
                    imagem_url: urlFinalDaImagem 
                }]);

                // ====================================================================
                // 3. O INTERRUPTOR INTELIGENTE (Gerencia a IA Real vs Simulação)
                // ====================================================================
                try {
                    let textoFinalRespostaIA = "";

                    if (selectedAI === 'simulacao') {
                        // [OPÇÃO A] MODO SIMULAÇÃO
                        console.log("⚠️ Modo simulação ativo. Pulando o Back-End.");
                        await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5s fictícios
                        textoFinalRespostaIA = "[Modo Simulação] O sistema está em testes locais. Sua imagem foi salva com sucesso no Supabase, mas o servidor Back-End e as APIs pagas não foram acionados para economizar requisições!";
                    } else {
                        // [OPÇÃO B] USO DA IA NORMAL
                        console.log("📡 Conectando à API do seu Back-End Node.js...");
                        const respostaBackend = await uploadImageToBackend(imageFile);
                        textoFinalRespostaIA = respostaBackend.resultadoIA; 
                    }

                    // 4. Joga a resposta na tela do chat
                    const aiMsg = { id: Date.now(), role: 'assistant', text: textoFinalRespostaIA, image: null };
                    setMessages(prev => [...prev, aiMsg]);
                    setLoading(false); 

                    // 5. Salva a resposta final de forma permanente no Supabase
                    await supabase.from('mensagens').insert([{
                        consulta_id: consultaId,
                        role: 'assistant',
                        texto: textoFinalRespostaIA,
                        ia_utilizada: selectedAI,
                        prompt_utilizado: selectedPrompt 
                    }]);

                } catch (err) {
                    console.error("❌ Falha de comunicação:", err);
                    setLoading(false);
                    const errorMsg = { 
                        id: Date.now(), 
                        role: 'assistant', 
                        text: "❌ Erro de conexão: Não consegui falar com o seu servidor Back-End. Verifique se ele está ligado ou mude o cabeçalho para o modo 'Simulação'.", 
                        image: null 
                    };
                    setMessages(prev => [...prev, errorMsg]);
                }
                // ====================================================================

            } else {
                console.error("Erro no upload da imagem:", uploadError);
                setLoading(false);
            }
        } else {
            // Código caso envie apenas texto sem anexar uma foto
            await supabase.from('mensagens').insert([{ consulta_id: consultaId, role: 'user', texto: textToSend, imagem_url: null }]);
            const avisoMsg = { id: Date.now(), role: 'assistant', text: "Para realizar a triagem, por favor, anexe uma imagem nítida da lesão.", image: null };
            setMessages(prev => [...prev, avisoMsg]);
            setLoading(false);
        }
        
        setImageFile(null); 
    };

    const handleUpload = (file) => {
        setImageFile(file);
    };

    return (
        <div className="flex h-screen w-full text-gray-100 font-sans relative">
            
            {/* O MODAL DE NOVA CONSULTA (Sobrepõe a tela inteira quando isModalOpen for true) */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-[#202123] p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-white">Nova Triagem</h2>
                        <form onSubmit={iniciarNovaConsulta}>
                            <label className="block text-sm text-gray-400 mb-2">Nome do Paciente / Identificador</label>
                            <input 
                                type="text" 
                                autoFocus
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="Ex: João da Silva"
                                className="w-full bg-[#343541] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 mb-6"
                            />
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold transition disabled:opacity-50"
                                    disabled={!patientName.trim()}
                                >
                                    Criar Consulta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Sidebar 
                onNewClick={() => setIsModalOpen(true)} 
                history={history} 
                activeId={consultaId}
                onSelect={selecionarConsultaAntiga}
            />
            
            <div className="flex-1 flex flex-col relative bg-[#343541]">
                <ChatHeader selectedAI={selectedAI} setSelectedAI={setSelectedAI} selectedPrompt={selectedPrompt} setSelectedPrompt={setSelectedPrompt} />
                
                <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll pb-40">
                    {!consultaId && messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                            <span className="text-4xl">🏥</span>
                            <p>Selecione um paciente no histórico ou inicie uma Nova Consulta.</p>
                        </div>
                    ) : (
                        <>
                            {messages.map(m => (
                                <ChatMessage key={m.id} message={m} />
                            ))}
                            {loading && <SkeletonLoader />}
                        </>
                    )}
                </div>
                
                {/* Esconde o input se não houver consulta aberta */}
                {consultaId && (
                    <ChatInput input={input} setInput={setInput} handleSend={handleSend} handleUpload={handleUpload} fileRef={fileRef} />
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);