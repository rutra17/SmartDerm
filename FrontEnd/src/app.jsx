import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import SkeletonLoader from './components/SkeletonLoader';
import { supabase } from './services/supabase'; // Conexão com o banco!

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [selectedAI, setSelectedAI] = useState('gemini');
    const [selectedPrompt, setSelectedPrompt] = useState('padrao');
    const [consultaId, setConsultaId] = useState(null); // Guarda o ID da sessão atual
    
    const scrollRef = useRef(null);
    const fileRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Cria uma nova consulta no banco ao iniciar o app
    useEffect(() => {
        const iniciarNovaConsulta = async () => {
            const { data, error } = await supabase
                .from('consultas')
                .insert([{}])
                .select()
                .single();

            if (error) {
                console.error("Erro ao criar consulta:", error);
                return;
            }

            setConsultaId(data.id);
            setMessages([
                { id: Date.now(), role: 'assistant', text: 'Bem-vindo ao sistema de triagem. Por favor, anexe uma imagem nítida da lesão na pele para análise da IA.', image: null }
            ]);
        };

        iniciarNovaConsulta();
    }, []);

    const simulateResponse = async (userText, userImg, currentConsultaId) => {
        setLoading(true);
        setTimeout(async () => {
            const responseText = userImg
                ? `Análise concluída via ${selectedAI.toUpperCase()} (Simulação do prompt: ${selectedPrompt}): Foram detectadas bordas irregulares e pigmentação mista. Recomendamos a consulta com um dermatologista para realizar uma dermatoscopia.`
                : "Para uma análise de câncer de pele, é necessário o envio de uma foto da lesão.";

            const responseMsg = {
                id: Date.now(),
                role: 'assistant',
                text: responseText,
                image: null
            };

            // Salva a resposta da IA no banco de dados
            if (currentConsultaId) {
                await supabase.from('mensagens').insert([{
                    consulta_id: currentConsultaId,
                    role: 'assistant',
                    texto: responseText,
                    ia_utilizada: selectedAI,
                    prompt_utilizado: selectedPrompt
                }]);
            }

            setMessages(prev => [...prev, responseMsg]);
            setLoading(false);
        }, 3000);
    };

    const handleSend = async (e, previewUrl = null) => {
        e.preventDefault();
        if (!input.trim() && !previewUrl) return;
        
        const textToSend = input.trim() ? input : "Imagem enviada para triagem.";
        const newMsg = { id: Date.now(), role: 'user', text: textToSend, image: previewUrl };
        
        setMessages(prev => [...prev, newMsg]);
        setInput('');

        // Salva a mensagem do usuário no banco de dados
        if (consultaId) {
            await supabase.from('mensagens').insert([{
                consulta_id: consultaId,
                role: 'user',
                texto: textToSend,
                imagem_url: previewUrl // ATENÇÃO: Temporário. Depois usaremos o Storage real.
            }]);
        }

        simulateResponse(input, previewUrl, consultaId);
    };

    const handleUpload = (file) => {
        console.log("Arquivo carregado:", file.name);
    };

    return (
        <div className="flex h-screen w-full text-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col relative bg-[#343541]">
                <ChatHeader 
                    selectedAI={selectedAI} setSelectedAI={setSelectedAI} 
                    selectedPrompt={selectedPrompt} setSelectedPrompt={setSelectedPrompt} 
                />
                <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll pb-40">
                    {messages.map(m => (
                        <ChatMessage key={m.id} message={m} />
                    ))}
                    {loading && <SkeletonLoader />}
                </div>
                <ChatInput 
                    input={input} setInput={setInput} 
                    handleSend={handleSend} handleUpload={handleUpload} fileRef={fileRef} 
                />
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);