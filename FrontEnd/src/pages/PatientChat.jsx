import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importações dos Componentes
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import SkeletonLoader from '../components/SkeletonLoader';

function PatientChat() {
    const navigate = useNavigate();

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
    
    // A. Capturar o nome do paciente logado através do LocalStorage
    useEffect(() => {
        const usuarioString = localStorage.getItem('usuario');
        if (usuarioString) {
            const usuario = JSON.parse(usuarioString);
            const primeiroNome = usuario.nome.split(' ')[0]; 
            setNomePaciente(primeiroNome);
        }
        
        // Carrega o histórico de consultas assim que a página abre
        carregarHistorico();
    }, []);

    // B. Rolagem automática para o final do chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Helper: Buscar o Token para autorizar os pedidos
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    // ==========================================
    // 3. FUNÇÕES DE BANCO DE DADOS E API (VIA BACK-END)
    // ==========================================

    const carregarHistorico = async () => {
        try {
            const resposta = await fetch('http://localhost:3000/api/consultas', {
                headers: getAuthHeaders()
            });
            if (resposta.ok) {
                const data = await resposta.json();
                setHistory(data.reverse()); // Inverte para mostrar as mais recentes primeiro
            }
        } catch (error) {
            console.error("❌ Erro ao buscar histórico:", error);
        }
    };

    const iniciarNovaConsulta = async (e) => {
        e.preventDefault();
        if (!patientName.trim()) return;

        setLoading(true);
        try {
            const resposta = await fetch('http://localhost:3000/api/consultas', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome_paciente: patientName })
            });

            if (resposta.ok) {
                const novaConsulta = await resposta.json();
                setConsultaId(novaConsulta.id);
                setMessages([]); 
                setPatientName('');
                setIsModalOpen(false); 
                carregarHistorico(); 
            }
        } catch (error) {
            console.error("❌ Erro ao iniciar consulta:", error);
        }
        setLoading(false);
    };

    const selecionarConsultaAntiga = async (id) => {
        setConsultaId(id);
        setMessages([]); 
        setLoading(true); 

        try {
            const resposta = await fetch(`http://localhost:3000/api/consultas/${id}/mensagens`, {
                headers: getAuthHeaders()
            });

            if (resposta.ok) {
                const data = await resposta.json();
                // Formata as mensagens vindas do Prisma para o formato que o seu componente espera
                const mensagensFormatadas = data.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    text: msg.texto,
                    image: msg.imagem_url
                }));
                setMessages(mensagensFormatadas);
            }
        } catch (error) {
            console.error("❌ Erro ao buscar mensagens:", error);
        }
        setLoading(false);
    };

    const handleUpload = (payload) => {
        const file = payload?.target?.files ? payload.target.files[0] : payload;

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }

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
        
        // Exibe imediatamente a mensagem do usuário na tela (Feedback visual rápido)
        const newMsg = { id: Date.now(), role: 'user', text: textToSend, image: imagePreview };
        setMessages(prev => [...prev, newMsg]);
        
        setInput('');
        setLoading(true);

        // Prepara um "Pacote" (FormData) que aceita tanto texto quanto arquivos pesados (imagens)
        const formData = new FormData();
        formData.append('consultaId', consultaId);
        formData.append('texto', textToSend);
        formData.append('ia_utilizada', selectedAI);
        formData.append('prompt_utilizado', selectedPrompt);
        
        if (imageFile) {
            formData.append('imagem', imageFile);
        }

        try {
            // Envia tudo de uma vez para o nosso Back-End
            const resposta = await fetch('http://localhost:3000/api/chat/enviar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    // O navegador coloca automaticamente o header "multipart/form-data" quando enviamos FormData
                },
                body: formData
            });

            if (resposta.ok) {
                const dadosRetorno = await resposta.json();
                
                // O Back-End devolve a resposta da IA. Adicionamos ela à tela.
                const aiMsg = { 
                    id: dadosRetorno.iaMensagem.id, 
                    role: 'assistant', 
                    text: dadosRetorno.iaMensagem.texto, 
                    image: null 
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error("Falha no servidor");
            }

        } catch (err) {
            console.error("❌ Falha de comunicação:", err);
            const errorMsg = { 
                id: Date.now(), 
                role: 'assistant', 
                text: "❌ Erro de conexão com o Back-End. Verifique se o servidor está ligado.", 
                image: null 
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        
        setLoading(false);
        setImageFile(null); 
        setImagePreview(null);
    };

    // ==========================================
    // FUNÇÃO DE LOGOUT SEGURO
    // ==========================================
    const fazerLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/'); 
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
                
                {/* NOVA BARRA SUPERIOR DE LOGOUT */}
                <div className="w-full flex justify-end px-4 py-3 bg-[#202123] border-b border-gray-700">
                    <button 
                        onClick={fazerLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-[#343541] hover:bg-red-600 border border-gray-600 hover:border-red-500 rounded-lg text-sm font-semibold transition-all text-gray-300 hover:text-white shadow-sm"
                        title="Sair e encerrar sessão"
                    >
                        <span>🚪</span> Sair do Portal
                    </button>
                </div>

                <ChatHeader selectedAI={selectedAI} setSelectedAI={setSelectedAI} selectedPrompt={selectedPrompt} setSelectedPrompt={setSelectedPrompt} />
                
                <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll pb-40">
                    
                    {/* SAUDAÇÃO PERSONALIZADA */}
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