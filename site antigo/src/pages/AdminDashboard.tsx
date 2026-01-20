import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Court, getAllCourts, updateCourt, getAvailablePowers, getAvailableSpheres } from '../services/courtService';
import { LogOut, Layout, Edit, Save, Plus, X, Eye, EyeOff } from 'lucide-react';

export default function AdminDashboard() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'regimes' | 'courts'>('regimes');
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        name: string;
        slug: string;
        power: string;
        sphere: string;
        visible: boolean;
        configJson: string;
    }>({ name: '', slug: '', power: '', sphere: '', visible: false, configJson: '' });

    useEffect(() => {
        fetchCourts();
    }, []);

    const fetchCourts = async () => {
        setLoading(true);
        const data = await getAllCourts();
        setCourts(data);
        setLoading(false);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const startEdit = (court: Court) => {
        setEditingCourt(court);
        setEditForm({
            name: court.name,
            slug: court.slug,
            power: court.power || '',
            sphere: court.sphere || '',
            visible: court.visible || false,
            configJson: JSON.stringify(court.config, null, 2)
        });
        setJsonError(null);
    };

    const cancelEdit = () => {
        setEditingCourt(null);
        setJsonError(null);
    };

    const saveEdit = async () => {
        if (!editingCourt) return;

        try {
            // Validate JSON
            const parsedConfig = JSON.parse(editForm.configJson);

            await updateCourt(editingCourt.id, {
                name: editForm.name,
                slug: editForm.slug,
                power: editForm.power,
                sphere: editForm.sphere,
                visible: editForm.visible,
                config: parsedConfig
            });

            alert('Salvo com sucesso!');
            setEditingCourt(null);
            fetchCourts(); // Refresh list
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                setJsonError(`Erro no JSON: ${err.message}`);
            } else {
                alert('Erro ao salvar no banco de dados');
                console.error(err);
            }
        }
    };

    const regimes = courts.filter(c => !c.parent_id);
    const organs = courts.filter(c => c.parent_id);

    const getParentName = (parentId?: string | null) => {
        if (!parentId) return '';
        const parent = courts.find(c => c.id === parentId);
        return parent ? parent.name : 'Desconhecido';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layout className="h-6 w-6 text-indigo-600" />
                        <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
                    </div>
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm font-medium">
                        <LogOut className="h-4 w-4" /> Sair
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">

                {/* Helper Instructions/Alert if data is empty (optional) */}

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('regimes')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${activeTab === 'regimes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Regimes & Leis Base ({regimes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('courts')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${activeTab === 'courts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Órgãos & Tribunais ({organs.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Carregando dados...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poder / Esfera</th>
                                        {activeTab === 'courts' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Herda De</th>}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(activeTab === 'regimes' ? regimes : organs).map((court) => (
                                        <tr key={court.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{court.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {court.power || '-'}
                                                </span>
                                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {court.sphere || '-'}
                                                </span>
                                            </td>
                                            {activeTab === 'courts' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {getParentName(court.parent_id) || <span className="text-orange-500 italic">Sem pai definido</span>}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {court.slug}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {court.visible ? (
                                                    <span className="flex items-center text-green-600 text-xs font-bold"><Eye className="h-3 w-3 mr-1" /> Visível</span>
                                                ) : (
                                                    <span className="flex items-center text-gray-400 text-xs"><EyeOff className="h-3 w-3 mr-1" /> Oculto</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => startEdit(court)} className="text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center">
                                                    <Edit className="h-4 w-4 mr-1" /> Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(activeTab === 'regimes' ? regimes : organs).length === 0 && (
                                <div className="p-8 text-center text-gray-500">Nenhum registro encontrado nesta categoria.</div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Action Button for Create (Mock for now, or functional logic can be added later) */}
            <button className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition" title="Em breve: Novo Tribunal">
                <Plus className="h-6 w-6" />
            </button>

            {/* Edit Modal (Sideover style for more space) */}
            {editingCourt && (
                <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 overflow-hidden">

                        {/* Background overlay */}
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelEdit}></div>

                        <div className="fixed inset-y-0 right-0 max-w-full flex">
                            <div className="w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 translate-x-0">
                                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">

                                    {/* Header */}
                                    <div className="px-4 py-6 bg-indigo-700 sm:px-6">
                                        <div className="flex items-start justify-between">
                                            <h2 className="text-lg font-medium text-white" id="slide-over-title">
                                                Editando: {editingCourt.name}
                                            </h2>
                                            <div className="ml-3 h-7 flex items-center">
                                                <button onClick={cancelEdit} className="bg-indigo-700 rounded-md text-indigo-200 hover:text-white focus:outline-none">
                                                    <span className="sr-only">Fechar</span>
                                                    <X className="h-6 w-6" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Form */}
                                    <div className="mt-6 relative flex-1 px-4 sm:px-6 space-y-6">

                                        {/* Basic Info Group */}
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Nome do Tribunal</label>
                                                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                                                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    value={editForm.slug} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} />
                                            </div>

                                            <div className="flex items-center pt-6">
                                                <label className="flex items-center cursor-pointer">
                                                    <div className="relative">
                                                        <input type="checkbox" className="sr-only" checked={editForm.visible} onChange={e => setEditForm({ ...editForm, visible: e.target.checked })} />
                                                        <div className={`block w-10 h-6 rounded-full ${editForm.visible ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${editForm.visible ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                    <div className="ml-3 text-sm font-medium text-gray-700">Visível no Site?</div>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Poder</label>
                                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    value={editForm.power} onChange={e => setEditForm({ ...editForm, power: e.target.value })}>
                                                    <option value="">Selecione...</option>
                                                    {getAvailablePowers().map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Esfera</label>
                                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    value={editForm.sphere} onChange={e => setEditForm({ ...editForm, sphere: e.target.value })}>
                                                    <option value="">Selecione...</option>
                                                    {getAvailableSpheres().map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* JSON Editor */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">Configuração JSON (Bases, Tabelas, Valores)</label>
                                                {jsonError && <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-200">{jsonError}</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">Edite com cautela. A estrutura deve respeitar a interface `CourtConfig`.</p>
                                            <textarea
                                                rows={25}
                                                className={`font-mono text-xs w-full p-4 rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${jsonError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
                                                value={editForm.configJson}
                                                onChange={e => {
                                                    setEditForm({ ...editForm, configJson: e.target.value });
                                                    setJsonError(null); // Clear error on change
                                                }}
                                            />
                                        </div>

                                    </div>

                                    {/* Footer Actions */}
                                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                                        <button onClick={cancelEdit} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                                            Cancelar
                                        </button>
                                        <button onClick={saveEdit} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none flex items-center">
                                            <Save className="h-4 w-4 mr-2" /> Salvar Alterações
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
