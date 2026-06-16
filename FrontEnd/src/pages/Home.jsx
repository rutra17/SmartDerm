import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/Smartderm.jfif';

function Home() {
    return (
        <main
            className="min-h-screen bg-smart-blue text-white flex flex-col"
            aria-labelledby="home-title"
        >
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-smart-mint text-smart-blue px-3 py-2 rounded-lg z-50"
            >
                Pular para o conteúdo
            </a>

            {/* HEADER */}
            <header className="border-b border-white/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="Logo SmartDerm AI"
                            className="h-12 w-12 rounded-lg object-cover"
                        />

                        <div>
                            <h1 className="font-bold text-lg">
                                SmartDerm AI
                            </h1>
                            <p className="text-xs text-gray-300">
                                Triagem dermatológica inteligente
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/login"
                        className="bg-smart-teal hover:brightness-110 transition px-5 py-2.5 rounded-lg font-semibold"
                    >
                        Entrar
                    </Link>
                </div>
            </header>

            {/* HERO */}
            <section
                id="main-content"
                className="flex-grow flex items-center py-20"
                tabIndex={-1}
            >
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

                    {/* Texto */}
                    <div>
                        <span className="inline-flex items-center rounded-full bg-smart-teal/20 border border-smart-teal/30 px-4 py-2 text-sm text-smart-mint mb-6">
                            Inteligência Artificial + Supervisão Médica
                        </span>

                        <h2
                            id="home-title"
                            className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
                        >
                            Triagem dermatológica
                            <span className="text-smart-mint"> inteligente </span>
                            com apoio de IA
                        </h2>

                        <p className="text-lg text-gray-300 leading-relaxed mb-8">
                            O SmartDerm AI auxilia na avaliação inicial de lesões
                            de pele através da análise de imagens dermatológicas.
                            A inteligência artificial identifica padrões visuais,
                            gera um relatório preliminar baseado nos critérios
                            ABCDE e encaminha os resultados para revisão médica.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/login"
                                className="bg-smart-teal hover:brightness-110 transition px-7 py-3 rounded-lg font-semibold"
                            >
                                Acessar Sistema
                            </Link>

                            <a
                                href="#como-funciona"
                                className="border border-white/20 hover:border-smart-mint hover:text-smart-mint transition px-7 py-3 rounded-lg"
                            >
                                Como funciona
                            </a>
                        </div>

                        <div className="flex flex-wrap gap-8 mt-10 text-sm text-gray-300">
                            <div>
                                <p className="text-smart-mint font-bold text-2xl">
                                    ABCDE
                                </p>
                                <p>Critérios dermatológicos</p>
                            </div>

                            <div>
                                <p className="text-smart-mint font-bold text-2xl">
                                    IA
                                </p>
                                <p>Análise automatizada</p>
                            </div>

                            <div>
                                <p className="text-smart-mint font-bold text-2xl">
                                    Médico
                                </p>
                                <p>Validação especializada</p>
                            </div>
                        </div>
                    </div>

                    {/* Card demonstrativo */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-xl">
                                    Exemplo de análise
                                </h3>

                                <span className="bg-smart-mint/20 text-smart-mint px-3 py-1 rounded-full text-xs font-semibold">
                                    IA
                                </span>
                            </div>

                            <div className="space-y-4">

                                <div className="flex items-center justify-between">
                                    <span>Assimetria</span>
                                    <span className="text-smart-mint">
                                        Detectada
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span>Bordas</span>
                                    <span className="text-smart-mint">
                                        Irregulares
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span>Coloração</span>
                                    <span className="text-smart-mint">
                                        Variada
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span>Diâmetro</span>
                                    <span className="text-smart-mint">
                                        &gt; 6 mm
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Nível de atenção</span>
                                    <span className="text-smart-mint font-semibold">
                                        Moderado
                                    </span>
                                </div>

                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-gradient-to-r from-smart-teal to-smart-mint rounded-full" />
                                </div>
                            </div>

                            <div className="mt-6 bg-smart-blue/50 border border-white/10 rounded-xl p-4">
                                <p className="text-sm text-gray-300">
                                    Resultado preliminar gerado pela IA e sujeito
                                    à validação de um profissional médico.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* COMO FUNCIONA */}
            <section
                id="como-funciona"
                className="py-24 bg-white/[0.03]"
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-4">
                        Como funciona
                    </h2>

                    <p className="text-center text-gray-300 max-w-2xl mx-auto mb-16">
                        Um fluxo simples e seguro que combina inteligência
                        artificial e revisão especializada.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="text-4xl mb-4">📷</div>
                            <h3 className="font-bold mb-2">
                                1. Envio da imagem
                            </h3>
                            <p className="text-gray-300 text-sm">
                                O paciente envia fotos da lesão para análise.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="text-4xl mb-4">🤖</div>
                            <h3 className="font-bold mb-2">
                                2. Análise da IA
                            </h3>
                            <p className="text-gray-300 text-sm">
                                A IA avalia critérios ABCDE e padrões visuais.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="font-bold mb-2">
                                3. Pré-relatório
                            </h3>
                            <p className="text-gray-300 text-sm">
                                Um resultado estruturado é gerado automaticamente.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="text-4xl mb-4">👨‍⚕️</div>
                            <h3 className="font-bold mb-2">
                                4. Revisão médica
                            </h3>
                            <p className="text-gray-300 text-sm">
                                O médico revisa e emite o laudo final.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* BENEFÍCIOS */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">

                    <h2 className="text-4xl font-bold text-center mb-16">
                        Benefícios da plataforma
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-bold mb-4 text-smart-mint">
                                Análise Inteligente
                            </h3>

                            <p className="text-gray-300">
                                Algoritmos de visão computacional auxiliam na
                                identificação de características relevantes das
                                lesões dermatológicas.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-bold mb-4 text-smart-mint">
                                Critérios ABCDE
                            </h3>

                            <p className="text-gray-300">
                                Avaliação estruturada baseada em critérios
                                amplamente utilizados na prática clínica.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-bold mb-4 text-smart-mint">
                                Supervisão Médica
                            </h3>

                            <p className="text-gray-300">
                                Os resultados não são entregues sem revisão
                                profissional, promovendo maior segurança.
                            </p>
                        </div>

                    </div>

                </div>
            </section>

            {/* DISCLAIMER */}
            <section className="border-y border-white/10 bg-smart-teal/10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-sm text-gray-200 text-center">
                        O SmartDerm AI é uma ferramenta de apoio à triagem
                        dermatológica. Os resultados gerados pela inteligência
                        artificial não substituem diagnóstico médico e devem ser
                        interpretados por profissionais de saúde qualificados.
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} SmartDerm AI — Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </main>
    );
}

export default Home;