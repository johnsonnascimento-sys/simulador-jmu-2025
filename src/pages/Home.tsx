import React, { useState } from 'react';
import { getAvailablePowers, getCourtsByFilter, Court } from '../services/courtService';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function Home() {
    const [step, setStep] = useState<'power' | 'sphere' | 'court'>('power');
    const [selectedPower, setSelectedPower] = useState<string>('');
    const [selectedSphere, setSelectedSphere] = useState<string>('');
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSelectPower = (power: string) => {
        setSelectedPower(power);
        setStep('sphere');
    };

    const getFilteredSpheres = () => {
        const allSpheres = ['Federal', 'Estadual', 'Distrital', 'Municipal'];
        if (selectedPower === 'Judiciário' || selectedPower === 'MP') {
            return ['Federal', 'Estadual'];
        }
        return allSpheres;
    };

    const handleSelectSphere = async (sphere: string) => {
        setSelectedSphere(sphere);
        setLoading(true);
        try {
            const results = await getCourtsByFilter(selectedPower, sphere);
            setCourts(results);
            setStep('court');
        } catch (error) {
            console.error(error);
            alert('Erro ao buscar tribunais.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        if (step === 'court') {
            setStep('sphere');
            setCourts([]);
        } else if (step === 'sphere') {
            setStep('power');
            setSelectedPower('');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">

            {/* Hero (Only show on first step) */}
            {step === 'power' && (
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary font-bold text-xs uppercase tracking-widest mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                        </span>
                        Atualizado para 2025
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                        Simule sua remuneração de forma <span className="gradient-text">precisa</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        Calculamos seu salário líquido com base na legislação vigente, progressões na carreira e benefícios específicos de cada esfera. Simples, rápido e 100% atualizado.
                    </p>
                </div>
            )}

            {/* Back Button */}
            {step !== 'power' && (
                <div className="mb-8">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 text-slate-500 hover:text-secondary font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                    </button>
                </div>
            )}

            {/* Title for Sub-steps */}
            {step === 'sphere' && (
                <div className="flex items-center gap-3 mb-10 border-l-4 border-secondary pl-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Escolha a Esfera ({selectedPower})
                    </h2>
                </div>
            )}
            {step === 'court' && (
                <div className="flex items-center gap-3 mb-10 border-l-4 border-secondary pl-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Selecione o Órgão ({selectedPower} - {selectedSphere})
                    </h2>
                </div>
            )}

            {step === 'power' && (
                <div className="flex items-center gap-3 mb-10 border-l-4 border-secondary pl-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Escolha o Poder</h2>
                </div>
            )}


            {/* Power Cards (Step 1) */}
            {step === 'power' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Judiciário */}
                    <button onClick={() => handleSelectPower('Judiciário')} className="group relative flex items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl card-hover transition-all duration-300 w-full text-left">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">gavel</span>
                        </div>
                        <div className="ml-6 flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Judiciário</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Simuladores do poder judiciário federal e estadual.</p>
                        </div>
                        <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-secondary transition-all">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </button>

                    {/* Executivo */}
                    <button onClick={() => handleSelectPower('Executivo')} className="group relative flex items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl card-hover transition-all duration-300 w-full text-left">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">account_balance</span>
                        </div>
                        <div className="ml-6 flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Executivo</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Servidores federais, estaduais e forças armadas.</p>
                        </div>
                        <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-primary transition-all">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </button>

                    {/* Legislativo */}
                    <button onClick={() => handleSelectPower('Legislativo')} className="group relative flex items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl card-hover transition-all duration-300 w-full text-left">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">foundation</span>
                        </div>
                        <div className="ml-6 flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Legislativo</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Câmara, Senado e Assembléias.</p>
                        </div>
                        <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-amber-500 transition-all">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </button>

                    {/* MP */}
                    <button onClick={() => handleSelectPower('MP')} className="group relative flex items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl card-hover transition-all duration-300 w-full text-left">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">balance</span>
                        </div>
                        <div className="ml-6 flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Ministério Público</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">MP da União e Estados.</p>
                        </div>
                        <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-rose-500 transition-all">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Step 2: Spheres */}
            {step === 'sphere' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getFilteredSpheres().map((s) => (
                        <button
                            key={s}
                            onClick={() => handleSelectSphere(s)}
                            className="group relative flex items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl card-hover transition-all duration-300 w-full text-left"
                        >
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-secondary group-hover:scale-110 transition-all">
                                <span className="material-symbols-outlined text-3xl">location_on</span>
                            </div>
                            <div className="ml-6 flex-grow">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{s}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Esfera {s.toLowerCase()}.</p>
                            </div>
                            <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-secondary transition-all">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 3: Courts */}
            {step === 'court' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-secondary rounded-full" role="status" aria-label="loading"></div>
                        </div>
                    ) : courts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {courts.map((court) => (
                                <div
                                    key={court.id}
                                    onClick={() => navigate(`/simulador/${court.slug}`)}
                                    className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-secondary dark:hover:border-secondary transition-all cursor-pointer flex items-center justify-between card-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center font-bold text-lg">
                                            {court.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-secondary transition-colors">{court.name}</span>
                                    </div>
                                    <button className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-6 py-2 rounded-xl hover:bg-secondary hover:text-white hover:border-secondary transition-all text-sm font-bold">
                                        Simular
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dotted border-slate-300 dark:border-slate-700">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">search_off</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Ops!</h3>
                            <p className="text-slate-500 text-sm">
                                Não encontramos simuladores para esta categoria.
                            </p>
                        </div>
                    )}
                </div>
            )}


            {/* Features (Only on home) */}
            {step === 'power' && (
                <div className="mt-24 bg-white dark:bg-slate-800/50 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Por que utilizar nosso simulador?</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
                                    <span className="text-slate-600 dark:text-slate-400">Dados 100% atualizados com as últimas tabelas de vencimento oficiais.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary mt-0.5">calculate</span>
                                    <span className="text-slate-600 dark:text-slate-400">Cálculo preciso de previdência (RPPS), IRRF e teto constitucional.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary mt-0.5">auto_graph</span>
                                    <span className="text-slate-600 dark:text-slate-400">Simule seu crescimento na carreira ao longo dos próximos anos.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl shadow-inner flex justify-center">
                            <div className="w-full max-w-sm aspect-video brand-gradient rounded-xl flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                                <span className="material-symbols-outlined text-6xl opacity-20 group-hover:scale-125 transition-transform duration-500">insights</span>
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-3xl font-black mb-1">R$ 15.420,00</p>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">Salário Líquido Estimado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
