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
    
    // NOVO: Estado para guardar o arquivo real da imagem antes do envio
    const [imageFile, setImageFile] = useState(null); 
    
    const scrollRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        const iniciarNovaConsulta = async () => {
            const { data, error } = await supabase.from('consultas').insert([{}]).select().single();
            if (!error) {
                setConsultaId(data.id);
                setMessages([
                    { id: Date.now(), role: 'assistant', text: 'Bem-vindo ao sistema de triagem. Por favor, anexe uma imagem nítida da lesão na pele para análise da IA.', image: null }
                ]);
            }
        };
        iniciarNovaConsulta();
    }, []);

    const simulateResponse = async (userText, userImgUrl, currentConsultaId) => {
        setTimeout(async () => {
            const responseText = userImgUrl
                ? `Análise concluída via ${selectedAI.toUpperCase()} (Simulação do prompt: ${selectedPrompt}): Foram detectadas bordas irregulares e pigmentação mista. Recomendamos a consulta com um dermatologista para realizar uma dermatoscopia.`
                : "Para uma análise de câncer de pele, é necessário o envio de uma foto da lesão.";

            const responseMsg = { id: Date.now(), role: 'assistant', text: responseText, image: null };

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
        
        // Impede envio vazio se não tiver texto nem imagem
        if (!input.trim() && !previewUrl) return;
        
        const textToSend = input.trim() ? input : "Imagem enviada para triagem.";
        const newMsg = { id: Date.now(), role: 'user', text: textToSend, image: previewUrl };
        
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true); // Inicia a animação de carregamento (Skeleton)

        let urlFinalDaImagem = null;

        // Faz o upload da imagem real para o Storage do Supabase
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('imagens-medicas')
                .upload(fileName, imageFile);

            if (!uploadError) {
                // Pega a URL pública da imagem que acabou de subir no Supabase
                const { data: publicUrlData } = supabase.storage
                    .from('imagens-medicas')
                    .getPublicUrl(fileName);
                
                urlFinalDaImagem = publicUrlData.publicUrl;

                // --- CONEXÃO COM O BACK-END AQUI ---
                try {
                    console.log("Enviando imagem para a API local (Back-End)...");
                    // Chama a função do api.js enviando o arquivo físico da imagem
                    const respostaBackend = await uploadImageToBackend(imageFile);
                    console.log("Resposta do Back-End:", respostaBackend);
                } catch (err) {
                    console.error("Falha ao enviar para o Back-End:", err);
                }
                // -----------------------------------

            } else {
                console.error("Erro no upload da imagem para o Supabase:", uploadError);
            }
        }
        
        setImageFile(null); // Limpa o arquivo selecionado da memória

        // Salva a mensagem no banco de dados (Supabase) usando a URL real da nuvem
        if (consultaId) {
            await supabase.from('mensagens').insert([{
                consulta_id: consultaId,
                role: 'user',
                texto: textToSend,
                imagem_url: urlFinalDaImagem 
            }]);
        }

        // Chama a IA (Por enquanto, a simulação. Em breve, a IA real)
        simulateResponse(textToSend, urlFinalDaImagem, consultaId);
    };

    // NOVO: Função atualizada para guardar o arquivo real no estado
    const handleUpload = (file) => {
        setImageFile(file);
    };

    return (
        <div className="flex h-screen w-full text-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col relative bg-[#343541]">
                <ChatHeader selectedAI={selectedAI} setSelectedAI={setSelectedAI} selectedPrompt={selectedPrompt} setSelectedPrompt={setSelectedPrompt} />
                <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll pb-40">
                    {messages.map(m => (
                        <ChatMessage key={m.id} message={m} />
                    ))}
                    {loading && <SkeletonLoader />}
                </div>
                <ChatInput input={input} setInput={setInput} handleSend={handleSend} handleUpload={handleUpload} fileRef={fileRef} />
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);