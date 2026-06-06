import React, { useState } from 'react';

export default function ChatInput({ input, setInput, handleSend, handleUpload, fileRef }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
            handleUpload(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const localHandleSend = (e) => {
        e.preventDefault();
        handleSend(e, previewUrl);
        setPreviewUrl(null);
    };

    return (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#343541] pt-10" onDragEnter={handleDrag}>
            <form onSubmit={localHandleSend} className="max-w-3xl mx-auto px-4 pb-10">
                {/* Preview de Imagem */}
                {previewUrl && (
                    <div className="mb-3 relative inline-block">
                        <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-emerald-500" />
                        <button type="button" onClick={() => setPreviewUrl(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600">✕</button>
                    </div>
                )}

                {/* Área de Input e Drag & Drop */}
                <div 
                    className={`relative flex items-center bg-[#40414f] rounded-xl border ${dragActive ? 'border-emerald-500 bg-[#40414f]/80' : 'border-white/10'} p-3 shadow-2xl transition-all`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                    <button type="button" onClick={() => fileRef.current.click()} className="p-2 text-gray-400 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </button>
                    <input type="file" ref={fileRef} onChange={(e) => handleFile(e.target.files[0])} className="hidden" accept="image/*" />
                    
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={dragActive ? "Solte a imagem aqui..." : "Envie uma imagem ou descreva a lesão..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm md:text-base text-white outline-none"
                    />
                    
                    <button type="submit" className="p-2 text-gray-400 hover:text-emerald-500 transition disabled:opacity-30" disabled={!input.trim() && !previewUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
