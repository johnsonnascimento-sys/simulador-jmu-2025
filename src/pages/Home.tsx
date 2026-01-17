import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calculator, TrendingUp, ShieldCheck, FileText, ArrowRight,
  Menu, X, ChevronRight, Lock, Building2, ChevronLeft, Sun, Moon, Heart, Mail, MapPin
} from 'lucide-react';
import logo from '../assets/logo.png';

// Definição dos tipos para evitar erro de TypeScript
type SimulatorNode = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  type: 'category' | 'simulator';
  slug?: string;
  children?: SimulatorNode[];
  description?: string;
};

// Dados da Navegação
const SIMULATOR_DATA: SimulatorNode[] = [
  {
    id: 'judiciario',
    name: 'Poder Judiciário',
    type: 'category',
    icon: <Building2 className="w-8 h-8 text-blue-600" />,
    description: 'Tribunais Federais, Estaduais e Superiores',
    children: [
      {
        id: 'jud_federal_sphere',
        name: 'Justiça Federal',
        type: 'category',
        icon: <Building2 className="w-6 h-6 text-blue-600" />,
        description: 'Tribunais da União',
        children: [
          {
            id: 'jud_militar',
            name: 'Justiça Militar da União',
            type: 'category',
            icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
            children: [
              {
                id: 'stm',
                name: 'STM e Auditorias (JMU)',
                type: 'simulator',
                slug: 'stm',
                description: 'Simulador completo para servidores da JMU (Lei 13.317/16 + Lei 15.292/26)'
              }
            ]
          },
          {
            id: 'jud_federal_comum',
            name: 'Justiça Federal (TRFs)',
            type: 'category',
            icon: <Building2 className="w-6 h-6 text-blue-500" />,
            children: [
              { id: 'trf1', name: 'TRF-1', type: 'simulator', slug: '#' },
              { id: 'trf2', name: 'TRF-2', type: 'simulator', slug: '#' },
              { id: 'trf3', name: 'TRF-3', type: 'simulator', slug: '#' },
              { id: 'trf4', name: 'TRF-4', type: 'simulator', slug: '#' },
              { id: 'trf5', name: 'TRF-5', type: 'simulator', slug: '#' },
              { id: 'trf6', name: 'TRF-6', type: 'simulator', slug: '#' }
            ]
          },
          {
            id: 'jud_eleitoral',
            name: 'Justiça Eleitoral',
            type: 'category',
            icon: <FileText className="w-6 h-6 text-blue-500" />,
            children: [
              { id: 'tse', name: 'TSE', type: 'simulator', slug: '#' },
              { id: 'tre_ac', name: 'TRE-AC', type: 'simulator', slug: '#' },
              { id: 'tre_al', name: 'TRE-AL', type: 'simulator', slug: '#' },
              // Adicione outros TREs conforme necessário, simplificado para "Em Breve" por enquanto
              { id: 'tre_outros', name: 'Outros TREs (Em Breve)', type: 'simulator', slug: '#' }
            ]
          },
          {
            id: 'jud_trabalho',
            name: 'Justiça do Trabalho',
            type: 'category',
            icon: <Building2 className="w-6 h-6 text-blue-500" />,
            children: [
              { id: 'tst', name: 'TST', type: 'simulator', slug: '#' },
              { id: 'trt_outros', name: 'TRTs (Em Breve)', type: 'simulator', slug: '#' }
            ]
          },
          {
            id: 'tjdft',
            name: 'TJDFT',
            type: 'category',
            icon: <Building2 className="w-6 h-6 text-blue-500" />,
            children: [
              { id: 'tjdft_sim', name: 'TJDFT (Em Breve)', type: 'simulator', slug: '#' }
            ]
          }
        ]
      },
      {
        id: 'jud_estadual_sphere',
        name: 'Justiça Estadual',
        type: 'category',
        icon: <Building2 className="w-6 h-6 text-emerald-600" />,
        description: 'Tribunais de Justiça (TJs)',
        children: [
          { id: 'tjac', name: 'TJAC', type: 'simulator', slug: '#' },
          { id: 'tjal', name: 'TJAL', type: 'simulator', slug: '#' },
          { id: 'tjam', name: 'TJAM', type: 'simulator', slug: '#' },
          { id: 'tjap', name: 'TJAP', type: 'simulator', slug: '#' },
          { id: 'tjba', name: 'TJBA', type: 'simulator', slug: '#' },
          { id: 'tjce', name: 'TJCE', type: 'simulator', slug: '#' },
          { id: 'tjes', name: 'TJES', type: 'simulator', slug: '#' },
          { id: 'tjgo', name: 'TJGO', type: 'simulator', slug: '#' },
          { id: 'tjma', name: 'TJMA', type: 'simulator', slug: '#' },
          { id: 'tjmg', name: 'TJMG', type: 'simulator', slug: '#' },
          { id: 'tjms', name: 'TJMS', type: 'simulator', slug: '#' },
          { id: 'tjmt', name: 'TJMT', type: 'simulator', slug: '#' },
          { id: 'tjpa', name: 'TJPA', type: 'simulator', slug: '#' },
          { id: 'tjpb', name: 'TJPB', type: 'simulator', slug: '#' },
          { id: 'tjpe', name: 'TJPE', type: 'simulator', slug: '#' },
          { id: 'tjpi', name: 'TJPI', type: 'simulator', slug: '#' },
          { id: 'tjpr', name: 'TJPR', type: 'simulator', slug: '#' },
          { id: 'tjrj', name: 'TJRJ', type: 'simulator', slug: '#' },
          { id: 'tjrn', name: 'TJRN', type: 'simulator', slug: '#' },
          { id: 'tjro', name: 'TJRO', type: 'simulator', slug: '#' },
          { id: 'tjrr', name: 'TJRR', type: 'simulator', slug: '#' },
          { id: 'tjrs', name: 'TJRS', type: 'simulator', slug: '#' },
          { id: 'tjsc', name: 'TJSC', type: 'simulator', slug: '#' },
          { id: 'tjse', name: 'TJSE', type: 'simulator', slug: '#' },
          { id: 'tjsp', name: 'TJSP', type: 'simulator', slug: '#' },
          { id: 'tjto', name: 'TJTO', type: 'simulator', slug: '#' }
        ]
      }
    ]
  },
  {
    id: 'mpu',
    name: 'Ministério Público',
    type: 'category',
    icon: <ShieldCheck className="w-8 h-8 text-rose-600" />,
    description: 'MPF, MPT, MPM e MPDFT',
    children: [
      { id: 'mpu_breve', name: 'Ramos do MPU (Em Breve)', type: 'simulator', slug: '#' }
    ]
  },
  {
    id: 'executivo',
    name: 'Poder Executivo',
    type: 'category',
    icon: <Building2 className="w-8 h-8 text-emerald-600" />,
    description: 'Ministérios e Autarquias Federais',
    children: [
      { id: 'exec_breve', name: 'Carreiras do Executivo (Em Breve)', type: 'simulator', slug: '#' }
    ]
  },
  {
    id: 'legislativo',
    name: 'Poder Legislativo',
    type: 'category',
    // Se Landmark der erro, usamos Building2 como fallback visual
    icon: <Building2 className="w-8 h-8 text-amber-600" />,
    description: 'Câmara dos Deputados e Senado Federal',
    children: [
      { id: 'leg_breve', name: 'Câmara e Senado (Em Breve)', type: 'simulator', slug: '#' }
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  // Estado para controlar a navegação em níveis
  const [navHistory, setNavHistory] = useState<SimulatorNode[]>([]);

  // Define qual nível mostrar: se não tiver histórico, mostra a raiz (SIMULATOR_DATA)
  // Se tiver histórico, mostra os filhos do último item clicado
  const currentLevel = navHistory.length > 0
    ? navHistory[navHistory.length - 1].children || []
    : SIMULATOR_DATA;

  const handleNodeClick = (node: SimulatorNode) => {
    if (node.type === 'simulator') {
      if (node.slug && node.slug !== '#') {
        navigate(`/simulador/${node.slug}`);
      } else {
        // Apenas para itens "Em breve"
        alert("Simulador em desenvolvimento. Tente a Justiça Militar.");
      }
    } else if (node.type === 'category' && node.children && node.children.length > 0) {
      setNavHistory([...navHistory, node]);
    }
  };

  const handleBack = () => {
    setNavHistory(prev => prev.slice(0, -1));
  };

  const scrollToSimulators = () => {
    const section = document.getElementById('simulators-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-secondary/20">

      {/* Navbar Unificada */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Salário do Servidor" className="w-16 h-16 object-contain" />
              <span className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                Salário do <span className="gradient-text">Servidor</span>
              </span>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-10">
              <button onClick={() => navigate('/')} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-secondary transition-colors">Início</button>
              <button onClick={scrollToSimulators} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-secondary transition-colors">Simuladores</button>
              <Link to="/apoiar" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-secondary transition-colors">Apoiar</Link>
            </div>

            {/* Ações */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/apoiar" className="btn btn-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold hover:shadow-lg hover:shadow-rose-500/30 transition-all">
                <Heart className="w-4 h-4" />
                Apoiar
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 dark:text-slate-300">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 space-y-4 shadow-xl absolute w-full">
            <button onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="block w-full text-left font-medium text-slate-600 dark:text-slate-300">Início</button>
            <button onClick={() => { scrollToSimulators(); setIsMobileMenuOpen(false); }} className="block w-full text-left font-medium text-slate-600 dark:text-slate-300">Simuladores</button>
            <hr className="border-slate-100 dark:border-slate-700" />
            <Link to="/apoiar" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-bold text-center">❤️ Apoiar o Projeto</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Atualizado: Tabelas 2025/2026
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
              O valor real do seu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-400">
                futuro financeiro.
              </span>
            </h1>

            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-xl">
              Pare de adivinhar. Simule seu salário líquido com precisão de centavos. Calculamos com base na legislação vigente, progressões, benefícios e simulações com Projetos de Lei.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToSimulators}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 hover:-translate-y-1"
              >
                Simular Agora <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 px-4 py-2">
                <p className="text-xs font-medium text-slate-500">
                  <strong className="text-slate-900">+2.000</strong> servidores usam
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                  <div>
                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-32 bg-slate-300 rounded-full"></div>
                  </div>
                  <div className="h-8 w-20 bg-emerald-100 rounded-lg"></div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase">Líquido Estimado</span>
                    <span className="text-2xl font-black text-secondary">R$ 15.450,32</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SEÇÃO DE SELEÇÃO (DRILL-DOWN) */}
      <section id="simulators-section" className="bg-white py-24 border-y border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Selecione seu Órgão</h2>
            <p className="text-slate-500">Navegue pelas esferas abaixo para encontrar a calculadora específica.</p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm min-h-[400px]">
            {/* Breadcrumb / Botão Voltar */}
            {navHistory.length > 0 && (
              <div className="mb-6 flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-secondary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-sm font-bold text-slate-800">{navHistory[navHistory.length - 1].name}</span>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLevel.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`
                    group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 
                    ${node.slug === '#' ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-secondary/5 hover:-translate-y-1 hover:border-secondary/30'}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300 text-slate-600 group-hover:text-secondary">
                      {node.icon || <Building2 className="w-6 h-6" />}
                    </div>
                    {node.slug === '#' ? (
                      <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Em Breve</span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        {node.type === 'category' ? 'Abrir' : 'Simular'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-secondary transition-colors">
                    {node.name}
                  </h3>

                  {node.description && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {node.description}
                    </p>
                  )}

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Recursos Exclusivos</h2>
            <p className="text-slate-500">Algumas ferramentas avançadas disponíveis para assinantes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-secondary mb-6">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Projeção de Carreira</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Visualize sua evolução salarial.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Cálculo Exato</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Algoritmos validados com tabelas oficiais.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Exportação PDF</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Gere holerites simulados profissionais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Unificado */}
      <footer className="bg-navy-dark text-slate-400 pt-20 pb-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Salário do Servidor" className="w-16 h-16 object-contain" />
                <span className="text-xl font-bold tracking-tight text-white">
                  Salário do <span className="gradient-text">Servidor</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                A ferramenta mais completa e precisa para simulação de remunerações no serviço público brasileiro. Transparência para quem serve à nação.
              </p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-secondary hover:text-white transition-all" href="#">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                </a>
                <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-secondary hover:text-white transition-all" href="#">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
                </a>
                <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-secondary hover:text-white transition-all" href="#">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Sobre o Site</h4>
              <ul className="space-y-4 text-sm">
                <li><a className="hover:text-primary transition-colors" href="#">Quem Somos</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Nossa Metodologia</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Privacidade e Termos</a></li>
                <li><Link to="/apoiar" className="hover:text-primary transition-colors">Apoiar o Projeto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Links Úteis</h4>
              <ul className="space-y-4 text-sm">
                <li><a className="hover:text-primary transition-colors" href="#">Portal da Transparência</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Receita Federal</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Diário Oficial</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Legislação Federal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Contato</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  contato@salariodoservidor.com.br
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  Brasília, DF
                </li>
                <li>
                  <Link to="/apoiar" className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <Heart className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                    Apoie o Projeto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-800 text-center md:flex md:justify-between md:text-left items-center">
            <p className="text-xs text-slate-500 mb-4 md:mb-0">
              © 2024 Salário do Servidor. Todos os direitos reservados.
              <span className="block md:inline mt-1 md:mt-0 md:ml-2 opacity-50">Dados meramente ilustrativos, sempre confira com seu órgão oficial.</span>
            </p>
            <div className="flex justify-center md:justify-end gap-6 text-xs font-semibold">
              <a className="hover:text-white transition-colors" href="#">Termos</a>
              <a className="hover:text-white transition-colors" href="#">Privacidade</a>
              <a className="hover:text-white transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}