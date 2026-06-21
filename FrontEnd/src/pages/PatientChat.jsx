import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importações dos Componentes
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

function PatientChat() {
    const navigate = useNavigate();

    // ==========================================
    // 1. ESTADOS DA APLICAÇÃO
    // ==========================================
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Configurações e Médicos
    const [selectedAI, setSelectedAI] = useState('gemini');
    const [selectedPrompt, setSelectedPrompt] = useState('padrao');
    const [listaMedicos, setListaMedicos] = useState([]);
    const [medicoSelecionado, setMedicoSelecionado] = useState('');
    
    // Gestão de Imagens e Consultas
    const [consultaId, setConsultaId] = useState(null); 
    const [imageFile, setImageFile] = useState(null); 
    const [imagePreview, setImagePreview] = useState(null);
    const [statusConsulta, setStatusConsulta] = useState('pendente');
    
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
    
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    useEffect(() => {
        const usuarioString = localStorage.getItem('usuario');
        if (usuarioString) {
            const usuario = JSON.parse(usuarioString);
            const primeiroNome = usuario.nome.split(' ')[0]; 
            setNomePaciente(primeiroNome);
        }
        
        carregarHistorico();
        carregarMedicos(); 
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // ==========================================
    // 3. FUNÇÕES DE BANCO DE DADOS E API
    // ==========================================

    const carregarHistorico = async () => {
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/consultas', { headers: getAuthHeaders() });
            if (resposta.ok) {
                const data = await resposta.json();
                setHistory(data.reverse());
            }
        } catch (error) {
            console.error("❌ Erro ao buscar histórico:", error);
        }
    };

    const carregarMedicos = async () => {
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/medicos', { headers: getAuthHeaders() });
            if (resposta.ok) {
                const data = await resposta.json();
                setListaMedicos(data);
            }
        } catch (error) {
            console.error("❌ Erro ao buscar médicos:", error);
        }
    };

    const iniciarNovaConsulta = async (e) => {
        e.preventDefault();
        if (!patientName.trim()) return;

        setLoading(true);
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/consultas', {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nome_paciente: patientName,
                    medicoId: medicoSelecionado || null
                })
            });

            if (resposta.ok) {
                const novaConsulta = await resposta.json();
                setConsultaId(novaConsulta.id);
                setStatusConsulta(novaConsulta.status);
                setMessages([]); 
                setPatientName('');
                setMedicoSelecionado('');
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

        const consultaAtual = history.find(c => c.id === id);
        if (consultaAtual) setStatusConsulta(consultaAtual.status);

        try {
            const resposta = await fetch(`https://api.smartderm.37.27.81.229.sslip.io/api/consultas/${id}/mensagens`, { headers: getAuthHeaders() });

            if (resposta.ok) {
                const data = await resposta.json();
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
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() && !imageFile) return;
        if (!consultaId) return alert("Por favor, inicie uma nova consulta primeiro!");
        
        const textToSend = input.trim() ? input : "Imagem enviada para triagem.";
        const newMsg = { id: Date.now(), role: 'user', text: textToSend, image: imagePreview };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        const formData = new FormData();
        formData.append('consultaId', consultaId);
        formData.append('texto', textToSend);
        formData.append('ia_utilizada', selectedAI);
        formData.append('prompt_utilizado', selectedPrompt);
        if (imageFile) formData.append('imagem', imageFile);

        try {
            const resposta = await fetch('http://localhost:3000/api/chat/enviar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });

            if (resposta.ok) {
                const dadosRetorno = await resposta.json();
                const aiMsg = { 
                    id: dadosRetorno.iaMensagem.id, 
                    role: 'assistant', 
                    text: dadosRetorno.iaMensagem.texto, 
                    image: null 
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (err) {
            const errorMsg = { id: Date.now(), role: 'assistant', text: "❌ Erro de conexão com o Back-End.", image: null };
            setMessages(prev => [...prev, errorMsg]);
        }
        
        setLoading(false);
        setImageFile(null); 
        setImagePreview(null);
    };

    const fazerLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/'); 
    };

    return (
        <div className="flex h-screen w-full text-gray-100 font-sans relative">
            
            {/* MODAL DE NOVA CONSULTA */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-[#202123] p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-emerald-500">Nova Triagem</h2>
                        <form onSubmit={iniciarNovaConsulta}>
                            
                            <label className="block text-sm text-gray-400 mb-2">Qual a queixa principal? (Título)</label>
                            <input 
                                type="text" 
                                autoFocus
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="Ex: Mancha vermelha no braço"
                                className="w-full bg-[#343541] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 mb-4"
                            />

                            <label className="block text-sm text-gray-400 mb-2">Encaminhar para qual médico?</label>
                            <select
                                value={medicoSelecionado}
                                onChange={(e) => setMedicoSelecionado(e.target.value)}
                                className="w-full bg-[#343541] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 mb-6"
                            >
                                <option value="">Qualquer especialista disponível</option>
                                {listaMedicos.map(med => (
                                    <option key={med.id} value={med.id}>Dr(a). {med.nome} (CRM: {med.crm})</option>
                                ))}
                            </select>

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
                                    Iniciar
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
                
                <div className="w-full flex justify-end px-4 py-3 bg-[#202123] border-b border-gray-700">
                    <button 
                        onClick={fazerLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-[#343541] hover:bg-red-600 border border-gray-600 hover:border-red-500 rounded-lg text-sm font-semibold transition-all text-gray-300 hover:text-white shadow-sm"
                    >
                        <span>🚪</span> Sair do Portal
                    </button>
                </div>

                <ChatHeader selectedAI={selectedAI} setSelectedAI={setSelectedAI} selectedPrompt={selectedPrompt} setSelectedPrompt={setSelectedPrompt} />
                
                <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll pb-40">
                    {!consultaId && messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-8 animate-fade-in flex-col gap-4 mt-10">
                            <span className="text-6xl mb-4">👋</span>
                            <h2 className="text-3xl font-bold text-emerald-500 mb-2">
                                Bem-vindo(a), {nomePaciente || 'Paciente'}!
                            </h2>
                            <p className="text-gray-400 max-w-md">
                                Clique em "+ Nova Consulta" para iniciar uma triagem e escolher o especialista.
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map(m => (
                                <ChatMessage key={m.id} message={m} />
                            ))}
                            
                            {/* 🌟 O PASSO 1 FOI COLOCADO EXATAMENTE AQUI! 🌟 */}
                            {loading && (
                                <div className="flex justify-start animate-fade-in py-4 px-4 sm:px-6 md:px-8">
                                    <div className="flex gap-4 p-4 rounded-xl max-w-3xl bg-[#202123] border border-gray-700 shadow-sm opacity-80">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl bg-purple-500/20 text-purple-400">
                                            🤖
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="font-semibold text-purple-400 text-sm">SmartDerm IA</span>
                                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                                <span>A analisar sintomas e imagem. Por favor, aguarde...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Se a consulta estiver 'finalizada', bloqueia o envio de novas mensagens */}
                {consultaId && (
                    <div className="p-4 bg-[#343541] border-t border-white/10 absolute bottom-0 w-full">
                        {statusConsulta === 'finalizada' ? (
                            <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-4 text-center text-emerald-400 font-semibold">
                                🔒 Esta consulta foi finalizada pelo médico. O diagnóstico já está disponível no chat.
                            </div>
                        ) : (
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientChat;