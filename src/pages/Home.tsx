import React, { useState } from 'react';
import { getAvailablePowers, getCourtsByFilter, Court } from '../services/courtService';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Scale, Gavel, Landmark, ArrowLeft, Briefcase } from 'lucide-react';

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
        // Regra de Negócio:
        // Judiciário e MP: Apenas "Federal" e "Estadual".
        // Executivo e Legislativo: "Federal", "Estadual", "Distrital" e "Municipal".
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

    // Icons helper
    const getPowerIcon = (p: string) => {
        switch (p) {
            case 'Judiciário': return <Scale className="h-8 w-8 text-blue-600" />;
            case 'Executivo': return <Briefcase className="h-8 w-8 text-green-600" />;
            case 'Legislativo': return <Landmark className="h-8 w-8 text-amber-600" />;
            case 'Ministério Público': return <Gavel className="h-8 w-8 text-red-600" />;
            case 'MP': return <Gavel className="h-8 w-8 text-red-600" />;
            default: return <Building2 className="h-8 w-8 text-gray-500" />;
        }
    };

    // Power Label Helper to match exact UI request (MP -> Ministério Público if needed)
    // Our service returns 'MP', but UI requested "Ministério Público". We can map it if we want, or adjust service logic.
    // Assuming service returns 'MP' as one of the powers. Let's stick to what service returns BUT map display.

    const powers = getAvailablePowers(); // ['Judiciário', 'Executivo', 'Legislativo', 'MP']

    const getPowerDisplay = (p: string) => {
        if (p === 'MP') return 'Ministério Público';
        return p;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200 py-16 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
                        Salário do Servidor
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Simule sua remuneração real com base na legislação vigente de forma simples e precisa.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">

                {step !== 'power' && (
                    <button onClick={reset} className="mb-8 flex items-center text-slate-600 hover:text-blue-600 transition font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                    </button>
                )}

                {/* Step 1: Power */}
                {step === 'power' && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700 mb-6 border-l-4 border-blue-500 pl-3">Escolha o Poder</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            {powers.map((p) => (
                                <div
                                    key={p}
                                    onClick={() => handleSelectPower(p)}
                                    className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer flex items-center gap-5 group"
                                >
                                    <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
                                        {getPowerIcon(p)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition">{getPowerDisplay(p)}</h3>
                                        <p className="text-sm text-slate-500 mt-1">Simuladores do poder {getPowerDisplay(p).toLowerCase()}.</p>
                                    </div>
                                    <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-blue-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Sphere */}
                {step === 'sphere' && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700 mb-6 border-l-4 border-green-500 pl-3">
                            Esfera ({getPowerDisplay(selectedPower)})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            {getFilteredSpheres().map((s) => (
                                <div
                                    key={s}
                                    onClick={() => handleSelectSphere(s)}
                                    className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer flex items-center gap-5 group"
                                >
                                    <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-green-50 transition-colors">
                                        <Building2 className="h-8 w-8 text-gray-400 group-hover:text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-700 transition">{s}</h3>
                                        <p className="text-sm text-slate-500 mt-1">Simuladores da esfera {s.toLowerCase()}.</p>
                                    </div>
                                    <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Courts List */}
                {step === 'court' && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700 mb-6 border-l-4 border-indigo-500 pl-3">
                            Órgãos Disponíveis ({getPowerDisplay(selectedPower)} - {selectedSphere})
                        </h2>

                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : courts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 animate-fade-in">
                                {courts.map((court) => (
                                    <div
                                        key={court.id}
                                        onClick={() => navigate(`/simulador/${court.slug}`)}
                                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                                {court.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-lg font-bold text-slate-800 group-hover:text-indigo-700">{court.name}</span>
                                        </div>
                                        <button className="bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition text-sm font-medium">
                                            Acessar Simulador
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Ops!</h3>
                                <p className="text-slate-500 text-lg max-w-md mx-auto">
                                    Ainda não temos simuladores cadastrados para esta categoria. Em breve!
                                </p>
                                <button onClick={reset} className="mt-6 text-blue-600 hover:text-blue-800 font-medium underline">
                                    Tentar outra categoria
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
