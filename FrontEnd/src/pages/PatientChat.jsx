import React, { useState, useRef, useEffect } from 'react';

// Importações dos Componentes
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import SkeletonLoader from '../components/SkeletonLoader';

// Importações dos Serviços
import { supabase } from '../services/supabase';
import { uploadImageToBackend } from '../services/api';

function PatientChat() {
    // ==========================================
    // 1. ESTADOS DA APLICAÇÃO
    // ==========================================
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Configurações
    const [selectedAI, setSelectedAI] = useState('gemini');
    const [selectedPrompt, setSelectedPrompt] = useState('padrao');
    
    // Gestão de Imagens e Consultas
    const [consultaId, setConsultaId] = useState(null); 
    const [imageFile, setImageFile] = useState(null); 
    const [imagePreview, setImagePreview] = useState(null);
    
    // Sidebar e Modais
    const [history, setHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [nomePaciente, setNomePaciente] = useState('');

    // Referências do DOM
    const scrollRef = useRef(null);
    const fileRef = useRef(null);

    // ==========================================
    // 2. EFEITOS COLATERAIS (USE EFFECT)
    // ==========================================
    
    // A. Capturar o nome do paciente logado
    useEffect(() => {
        const carregarPerfilDoPaciente = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.user_metadata) {
                const nomeReal = user.user_metadata.nome_completo;
                const primeiroNome = nomeReal.split(' ')[0]; 
                setNomePaciente(primeiroNome);
            }
        };
        carregarPerfilDoPaciente();
    }, []);

    // B. Rolagem automática para o final do chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // C. Carregar histórico ao abrir
    useEffect(() => {
        carregarHistorico();
    }, []);

    // ==========================================
    // 3. FUNÇÕES DE BANCO DE DADOS E API
    // ==========================================

    const carregarHistorico = async () => {
        console.log("📡 Buscando histórico no Supabase...");
        const { data, error } = await supabase.from('consultas').select('*');

        if (error) {
            console.error("❌ Erro ao buscar histórico:", error);
        } else if (data) {
            console.log("✅ Histórico encontrado:", data);
            const historicoInvertido = data.reverse(); 
            setHistory(historicoInvertido);
        }
    };

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
            setMessages([]); // Inicia o chat limpo
            setPatientName('');
            setIsModalOpen(false); 
            carregarHistorico(); 
        }
        setLoading(false);
    };

    const selecionarConsultaAntiga = async (id) => {
        console.log(`📡 Buscando mensagens para a consulta ID: ${id}...`);
        
        setConsultaId(id);
        setMessages([]); 
        setLoading(true); 

        const { data, error } = await supabase
            .from('mensagens')
            .select('*')
            .eq('consulta_id', id);

        if (error) {
            console.error("❌ Erro ao buscar as mensagens do chat:", error);
        } else if (data) {
            console.log("✅ Mensagens encontradas no banco:", data);
            const mensagensOrdenadas = data.sort((a, b) => a.id - b.id);
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

    // Função para ler a imagem, gerar o preview e permitir imagens repetidas
    const handleUpload = (payload) => {
        // 1. Resolve o Erro no Console: 
        // Se vier o evento do input, extraímos. Se o ChatInput já mandar o arquivo direto, nós apenas usamos ele.
        const file = payload?.target?.files ? payload.target.files[0] : payload;

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }

        // 2. Resolve o Bug da Imagem Repetida:
        // Limpamos a memória do input fantasma instantaneamente. 
        // Assim, o navegador vai aceitar se você selecionar exatamente a mesma foto de novo!
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        
        if (!input.trim() && !imageFile) return;
        if (!consultaId) {
            alert("Por favor, inicie uma nova consulta primeiro!");
            return;
        }
        
        const textToSend = input.trim() ? input : "Imagem enviada para triagem.";
        const newMsg = { id: Date.now(), role: 'user', text: textToSend, image: imagePreview };
        
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        let urlFinalDaImagem = null;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            // 1. Upload físico para o Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('imagens-medicas')
                .upload(fileName, imageFile);

            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                    .from('imagens-medicas')
                    .getPublicUrl(fileName);
                
                urlFinalDaImagem = publicUrlData.publicUrl;

                // 2. Grava a mensagem do USUÁRIO no banco de dados
                await supabase.from('mensagens').insert([{
                    consulta_id: consultaId,
                    role: 'user',
                    texto: textToSend,
                    imagem_url: urlFinalDaImagem 
                }]);

                // 3. Conexão real com o Back-End / IA
                // 3. O INTERRUPTOR INTELIGENTE (Gerencia a IA Real vs Simulação)
                try {
                    let textoFinalRespostaIA = "";

                    if (selectedAI === 'simulacao') {
                        console.log("⚠️ Modo simulação ativo. Pulando o Back-End.");
                        await new Promise(resolve => setTimeout(resolve, 1500)); 
                        textoFinalRespostaIA = `[Modo Simulação] Teste executado com sucesso!\nIA selecionada: ${selectedAI}\nID do Prompt aplicado: ${selectedPrompt}\nSua imagem foi salva de forma isolada na nuvem.`;
                    } else {
                        console.log(`📡 Conectando ao Back-End usando o modelo: ${selectedAI} e prompt ID: ${selectedPrompt}`);
                        
                        // Enviando os parâmetros selecionados no cabeçalho do front para a API local
                        const respostaBackend = await uploadImageToBackend(imageFile, textToSend, selectedAI, selectedPrompt);
                        textoFinalRespostaIA = respostaBackend.resultadoIA; 
                    }

                    // 4. Joga a resposta da IA (ou da simulação) na tela
                    const aiMsg = { id: Date.now(), role: 'assistant', text: textoFinalRespostaIA, image: null };
                    setMessages(prev => [...prev, aiMsg]);

                    // 5. Salva a resposta final de forma permanente no Supabase com os dados do Cientista
                    await supabase.from('mensagens').insert([{
                        consulta_id: consultaId,
                        role: 'assistant',
                        texto: textoFinalRespostaIA,
                        ia_utilizada: selectedAI,
                        prompt_utilizado: selectedPrompt // Salvando de forma correta para os gráficos
                    }]);

                } catch (err) {
                    console.error("❌ Falha de comunicação:", err);
                    const errorMsg = { 
                        id: Date.now(), 
                        role: 'assistant', 
                        text: "❌ Erro de conexão com a IA ou Back-End. Verifique se o servidor está ligado.", 
                        image: null 
                    };
                    setMessages(prev => [...prev, errorMsg]);
                }
            } else {
                console.error("Erro no upload da imagem:", uploadError);
            }
        } else {
            // Se enviar apenas texto sem imagem
            await supabase.from('mensagens').insert([{ consulta_id: consultaId, role: 'user', texto: textToSend, imagem_url: null }]);
            const avisoMsg = { id: Date.now(), role: 'assistant', text: "Para realizar a triagem, por favor, anexe uma imagem nítida da lesão.", image: null };
            setMessages(prev => [...prev, avisoMsg]);
        }
        
        setLoading(false);
        setImageFile(null); 
        setImagePreview(null);
    };

    // ==========================================
    // 4. INTERFACE VISUAL (RENDER)
    // ==========================================
    return (
        <div className="flex h-screen w-full text-gray-100 font-sans relative">
            
            {/* MODAL DE NOVA CONSULTA */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-[#202123] p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-emerald-500">Nova Triagem</h2>
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
                    
                    {/* SAUDAÇÃO PERSONALIZADA (Aparece apenas quando não há consulta selecionada) */}
                    {!consultaId && messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-8 animate-fade-in flex-col gap-4 mt-10">
                            <span className="text-6xl mb-4">👋</span>
                            <h2 className="text-3xl font-bold text-emerald-500 mb-2">
                                Bem-vindo(a), {nomePaciente || 'Doutor(a)'}!
                            </h2>
                            <p className="text-gray-400 max-w-md">
                                Selecione um paciente no histórico lateral ou clique em "+ Nova Consulta" para iniciar uma triagem dermatológica.
                            </p>
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
                    <div className="p-4 bg-[#343541] border-t border-white/10 absolute bottom-0 w-full">
                        <ChatInput 
                            input={input} 
                            setInput={setInput} 
                            handleSend={handleSend} 
                            handleUpload={handleUpload} 
                            fileRef={fileRef} 
                            imagePreview={imagePreview}
                            setImagePreview={setImagePreview}
                            setImageFile={setImageFile}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientChat;