import React, { useState, useRef, useEffect } from 'react';

import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import SkeletonLoader from '../components/SkeletonLoader';

import { getConsultas, criarConsulta, getMensagens, uploadImageToBackend, criarMensagem } from '../services/api';

function PatientChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedAI, setSelectedAI] = useState('gemini');
    const [selectedPrompt, setSelectedPrompt] = useState('padrao');

    const [consultaId, setConsultaId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [history, setHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nomePaciente, setNomePaciente] = useState('');

    const scrollRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('smartderm_user') || '{}');
        if (user.nome) {
            setNomePaciente(user.nome.split(' ')[0]);
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        carregarHistorico();
    }, []);

    const carregarHistorico = async () => {
        const data = await getConsultas();
        if (Array.isArray(data)) {
            setHistory(data);
        }
    };

    const iniciarNovaConsulta = async () => {
        setLoading(true);
        const data = await criarConsulta();

        if (data && data.id) {
            setConsultaId(data.id);
            setMessages([]);
            setIsModalOpen(false);
            carregarHistorico();
        }
        setLoading(false);
    };

    const selecionarConsultaAntiga = async (id) => {
        setConsultaId(id);
        setMessages([]);
        setLoading(true);

        const data = await getMensagens(id);

        if (Array.isArray(data)) {
            const formatadas = data.map(msg => ({
                id: msg.id,
                role: msg.role,
                text: msg.texto,
                image: msg.imagem_url,
            }));
            setMessages(formatadas);
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
        if (!consultaId) {
            alert("Por favor, inicie uma nova consulta primeiro!");
            return;
        }

        const textToSend = input.trim() ? input : "Imagem enviada para triagem.";
        const newMsg = { id: Date.now(), role: 'user', text: textToSend, image: imagePreview };

        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        if (imageFile) {
            try {
                let textoFinalRespostaIA = "";

                if (selectedAI === 'simulacao') {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    textoFinalRespostaIA = `[Modo Simulação] Teste executado!\nIA: ${selectedAI}\nPrompt: ${selectedPrompt}`;

                    // Salva mensagens no banco mesmo em simulação
                    await criarMensagem({ consulta_id: consultaId, role: 'user', texto: textToSend });
                    await criarMensagem({ consulta_id: consultaId, role: 'assistant', texto: textoFinalRespostaIA, ia_utilizada: 'simulacao', prompt_utilizado: selectedPrompt });
                } else {
                    // O backend salva as mensagens (user + assistant) automaticamente
                    const resposta = await uploadImageToBackend(imageFile, textToSend, selectedAI, selectedPrompt, consultaId);
                    textoFinalRespostaIA = resposta.resultadoIA;
                }

                const aiMsg = { id: Date.now(), role: 'assistant', text: textoFinalRespostaIA, image: null };
                setMessages(prev => [...prev, aiMsg]);

            } catch (err) {
                console.error("❌ Falha:", err);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'assistant',
                    text: "❌ Erro de conexão com a IA ou Back-End. Verifique se o servidor está ligado.",
                    image: null,
                }]);
            }
        } else {
            await criarMensagem({ consulta_id: consultaId, role: 'user', texto: textToSend });
            const avisoMsg = { id: Date.now(), role: 'assistant', text: "Para realizar a triagem, por favor, anexe uma imagem nítida da lesão.", image: null };
            setMessages(prev => [...prev, avisoMsg]);
        }

        setLoading(false);
        setImageFile(null);
        setImagePreview(null);
    };

    const fazerLogout = () => {
        localStorage.removeItem('smartderm_token');
        localStorage.removeItem('smartderm_user');
        window.location.replace('/');
    };

    return (
        <div className="flex h-screen w-full text-gray-100 font-sans relative">

            {isModalOpen && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-[#202123] p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-fade-in">
                        <h2 className="text-xl font-bold mb-2 text-emerald-500">Nova Triagem</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Uma nova consulta será criada para <span className="text-white font-semibold">{nomePaciente}</span>.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700 transition">Cancelar</button>
                            <button type="button" disabled={loading} onClick={iniciarNovaConsulta} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold transition disabled:opacity-50">
                                {loading ? 'Criando...' : 'Confirmar'}
                            </button>
                        </div>
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
                                Selecione um paciente no histórico lateral ou clique em "+ Nova Consulta" para iniciar uma triagem dermatológica.
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map(m => <ChatMessage key={m.id} message={m} />)}
                            {loading && <SkeletonLoader />}
                        </>
                    )}
                </div>

                {consultaId && (
                    <div className="p-4 bg-[#343541] border-t border-white/10 absolute bottom-0 w-full">
                        <ChatInput
                            input={input} setInput={setInput}
                            handleSend={handleSend} handleUpload={handleUpload}
                            fileRef={fileRef} imagePreview={imagePreview}
                            setImagePreview={setImagePreview} setImageFile={setImageFile}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientChat;
