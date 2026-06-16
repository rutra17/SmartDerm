import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/Smartderm.jfif';

function Home() {
    return (
        <main className="min-h-screen bg-gray-700 text-white flex flex-col" aria-labelledby="home-title">
             <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-smart-mint text-black px-3 py-2 rounded">Pular para o conteúdo</a>

            <header className="py-8 px-4 border-b border-gray-700">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <img src={logo} alt="Logo da SmartDerm" className="h-12" />
                    <nav aria-label="Principal">
                        <ul className="flex gap-4">
                            <li><Link to="/login" className="bg-emerald-500 text-white font-semibold px-5 py-3 rounded focus:outline-none focus:ring-2 focus:ring-smart-teal transition duration-300 ease-in-out hover:bg-emerald-600">Entrar</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <section id="main-content" className="flex-grow flex items-center" tabIndex={-1}>
                <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 id="home-title" className="text-4xl font-extrabold mb-4 text-white">Diagnóstico dermatológico com auxílio de IA — acessível e seguro</h2>
                        <p className="text-gray-300 mb-6">O SmartDerm utiliza inteligência artificial para analisar imagens dermatológicas e identificar padrões visuais relevantes, oferecendo informações claras e acessíveis que auxiliam pacientes e profissionais de saúde na compreensão dos achados observados.</p>

                        <ul className="mt-8 space-y-3 text-gray-300">
                            <li><strong>Análise avançada de imagens:</strong> algoritmos de inteligência artificial examinam características visuais de lesões dermatológicas, destacando aspectos que podem contribuir para uma avaliação mais detalhada.</li>
                            <li><strong>Resultados explicativos e transparentes:</strong> em vez de apresentar apenas respostas simples, o SmartDerm descreve os sinais visuais identificados e fornece informações que auxiliam na interpretação dos resultados.</li>
                            <li><strong>Relatórios detalhados e compreensíveis:</strong> cada análise é acompanhada de explicações visuais e textuais, facilitando a comunicação entre pacientes, profissionais de saúde e pesquisadores.</li>
                        </ul>
                    </div>

                    <div aria-hidden="true">
                        {/*<img src="/hero-illustration.png" alt="Ilustração representando dermatologia assistida por inteligência artificial" className="w-full rounded-lg shadow-md" /> */}
                        {/*<p className="text-sm text-gray-400 mt-2">Ilustração conceitual — imagens reais são mostradas apenas em contextos clínicos.</p> */}
                    </div>
                </div>
            </section>

            <footer className="py-6 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400">© {new Date().getFullYear()} SmartDerm — Todos os direitos reservados</p>

                </div>
            </footer>
        </main>
    );
}

export default Home;
