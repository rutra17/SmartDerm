import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <main className="min-h-screen bg-smart-blue text-white flex flex-col" aria-labelledby="home-title">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute top-4 left-4 bg-smart-mint text-black px-3 py-2 rounded">Pular para o conteúdo</a>

            <header className="py-8 px-4 border-b border-gray-700">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <img src="src\assets\img\Smartderm.jfif" alt="Logo da SmartDerm" className="h-12" />
                    <nav aria-label="Principal">
                        <ul className="flex gap-4">
                            <li><Link to="/login" className="bg-emerald-500 text-white font-semibold px-5 py-3 rounded focus:outline-none focus:ring-2 focus:ring-smart-teal transition duration-300 ease-in-out hover:bg-emerald-600">Entrar</Link></li>
                            <li><Link to="/cadastro" className="border border-smart-mint text-smart-mint px-5 py-3 rounded focus:outline-none focus:ring-2 focus:ring-smart-teal transition duration-300 ease-in-out hover:bg-emerald-700 hover:text-white">Registro</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <section id="main-content" className="flex-grow flex items-center" tabIndex={-1}>
                <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 id="home-title" className="text-4xl font-extrabold mb-4 text-white">Diagnóstico dermatológico com auxílio de IA — acessível e seguro</h2>
                        <p className="text-gray-300 mb-6">O SmartDerm aproxima pacientes, médicos e cientistas com ferramentas intuitivas e pensadas para acessibilidade: contraste alto, navegação por teclado e compatibilidade com leitores de tela.</p>
                        <div className="flex gap-4">
                            <Link to="/login" className="bg-emerald-500 text-white font-semibold px-5 py-3 rounded focus:outline-none focus:ring-2 focus:ring-smart-teal transition duration-300 ease-in-out hover:bg-emerald-600">Entrar no sistema</Link>
                           {/*} <Link to="/cadastro" className="bg-sky-700 border border-smart-mint text-smart-mint px-5 py-3 rounded focus:outline-none focus:ring-2 focus:ring-smart-teal hover:bg-smart-mint hover:text-black">Cadastre-se</Link> */}
                        </div>

                        <ul className="mt-8 space-y-3 text-gray-300">
                            <li><strong>Design acessível:</strong> interface com alto contraste, navegação por teclado e suporte a leitores de tela — pensada para ser usada por qualquer pessoa.</li>
                            <li><strong>Análises além do sim/não:</strong> o SmartDerm examina imagens e aponta sinais visuais relevantes, entregando um resultado claro e descritivo em vez de apenas "positivo/negativo".</li>
                            <li><strong>Laudos que fazem sentido:</strong> cada relatório traz explicações visuais e textuais que ajudam você e o profissional de saúde a entender o que foi observado.</li>
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
                    <nav aria-label="Rodapé">
                        <ul className="flex gap-4">
                            <li><a href="#" className="text-smart-mint hover:underline">Políticas de Privacidade</a></li>
                        </ul>
                    </nav>
                </div>
            </footer>
        </main>
    );
}

export default Home;
