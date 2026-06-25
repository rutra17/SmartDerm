import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/Logo_WH.png';

function Home() {
    const [step, setStep] = useState(0);
{/* UseEffect melhorado */}
    useEffect(() => {
        let stepValue = 0;

        const interval = setInterval(() => {
            stepValue += 1;
            setStep(stepValue);

            if(stepValue >= 6){
                clearInterval(interval);
            }
        }, 800);

        return() => clearInterval(interval);
    }, []);

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
                            className="h-16 w-30"
                        />
                    {/* Ocultado devido a destaque na logo nova}
                        <div>
                            <h1 className="font-bold text-lg">
                                SmartDerm AI
                            </h1>
                            <p className="text-xs text-gray-300">
                                Triagem dermatológica inteligente
                            </p>
                        </div>
                    */}
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
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">

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
                                Como funciona?
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

                    {/* Card demonstrativo animado */}
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden transition-all duration-700 ease-in-out">

                            <div className="absolute inset-0 bg-gradient-to-br from-smart-mint/5 via-transparent to-transparent pointer-events-none" />

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-xl">
                                    Exemplo de análise
                                </h3>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${step >= 6
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-smart-mint/20 text-smart-mint'
                                        }`}
                                >
                                    {step >= 6 ? 'MÉDICO' : 'IA'}
                                </span>
                            </div>

                            {/* Imagem simulada */}
                            <div className="relative h-32 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 mb-6 overflow-hidden border border-white/10">

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-amber-700/60 border border-amber-500" />
                                </div>

                                {step < 5 && (
                                    <div
                                        className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-smart-mint/30 to-transparent"
                                        style={{
                                            left: `${step * 20}%`,
                                            transition: 'all 1s ease'
                                        }}
                                    />
                                )}
                            </div>

                            <div className="space-y-3 min-h-[190px]">

                                <div
                                    className={`flex items-center justify-between transition-all duration-500 ${step >= 1
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-3'
                                        }`}
                                >
                                    <span>Assimetria</span>
                                    <span className="text-smart-mint">Detectada</span>
                                </div>

                                <div
                                    className={`flex items-center justify-between transition-all duration-500 ${step >= 2
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-3'
                                        }`}
                                >
                                    <span>Bordas</span>
                                    <span className="text-smart-mint">Irregulares</span>
                                </div>

                                <div
                                    className={`flex items-center justify-between transition-all duration-500 ${step >= 3
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-3'
                                        }`}
                                >
                                    <span>Coloração</span>
                                    <span className="text-smart-mint">Variada</span>
                                </div>

                                <div
                                    className={`flex items-center justify-between transition-all duration-500 ${step >= 4
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-3'
                                        }`}
                                >
                                    <span>Diâmetro</span>
                                    <span className="text-smart-mint">
                                        &gt; 6 mm
                                    </span>
                                </div>

                                {step >= 5 && (
                                    <div className={`rounded-xl border border-smart-mint/20 bg-smart-mint/10 p-3 ${step === 5 ? 'animate-pulse' : ''}`}>
                                        <p className="text-sm text-smart-mint">
                                            ✓ Pré-relatório gerado pela IA
                                        </p>
                                    </div>
                                )}

                                <div
                                    className={`overflow-hidden transition-all duration-700 ease-in-out ${step >= 6
                                        ? 'max-h-[320px] opacity-100 translate-y-0 mt-3'
                                        : 'max-h-0 opacity-0 -translate-y-2 mt-0'
                                        }`}
                                >
                                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                                        <p className="font-semibold text-green-300 mb-3">
                                            Laudo Médico
                                        </p>

                                        <div className="text-sm text-gray-300 space-y-2">
                                            <p>
                                                <strong>Parecer:</strong> Lesão pigmentada apresentando assimetria
                                                discreta, bordas irregulares e variação de coloração.
                                            </p>

                                            <p>
                                                <strong>Conclusão:</strong> Achados compatíveis com lesão melanocítica
                                                que requer acompanhamento clínico.
                                            </p>

                                            <p>
                                                <strong>Status:</strong> Relatório revisado e validado pelo médico.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Status da análise</span>

                                    <span className="text-smart-mint font-semibold">
                                        {step === 0 && 'Preparando'}
                                        {step === 1 && '20%'}
                                        {step === 2 && '40%'}
                                        {step === 3 && '60%'}
                                        {step === 4 && '80%'}
                                        {step === 5 && '95%'}
                                        {step === 6 && 'Concluído'}
                                    </span>
                                </div>

                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-smart-teal to-smart-mint transition-all duration-700"
                                        style={{
                                            width:
                                                step === 0 ? '5%' :
                                                    step === 1 ? '20%' :
                                                        step === 2 ? '40%' :
                                                            step === 3 ? '60%' :
                                                                step === 4 ? '80%' :
                                                                    step === 5 ? '95%' :
                                                                        '100%'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 bg-smart-blue/50 border border-white/10 rounded-xl p-4">
                                <p className="text-sm text-gray-300">
                                    Demonstração ilustrativa do fluxo entre inteligência artificial
                                    e validação médica especializada.
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
                        Como funciona?
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