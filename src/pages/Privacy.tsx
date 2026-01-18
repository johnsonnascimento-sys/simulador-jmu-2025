import React from 'react';
import { Shield, FileText, Lock, Eye } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                                Privacidade e <span className="gradient-text">Termos</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Última atualização: Janeiro de 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-8">

                        {/* Política de Privacidade */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="w-6 h-6 text-secondary" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">Política de Privacidade</h2>
                            </div>
                            <p>
                                O <strong>Salário do Servidor</strong> valoriza a privacidade de seus usuários. Esta política descreve como coletamos, usamos e protegemos suas informações.
                            </p>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dados Coletados</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Não coletamos dados pessoais identificáveis sem seu consentimento.</li>
                                <li>Os cálculos realizados na calculadora são processados localmente no seu navegador.</li>
                                <li>Não utilizamos cookies para rastrear sua navegação.</li>
                            </ul>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Uso dos Dados</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Análise de uso anônima para melhorar o serviço.</li>
                                <li>Nenhum dado é vendido ou compartilhado com terceiros.</li>
                            </ul>
                        </section>

                        {/* Termos de Uso */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-6 h-6 text-secondary" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">Termos de Uso</h2>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border-l-4 border-amber-500 my-6">
                                <p className="m-0 text-amber-800 dark:text-amber-200">
                                    <strong>Aviso Importante:</strong> Os valores apresentados são meramente ilustrativos e têm caráter informativo. Sempre confira com seu órgão oficial para informações definitivas.
                                </p>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Uso Permitido</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>O site pode ser utilizado gratuitamente para fins pessoais.</li>
                                <li>As simulações são baseadas na legislação vigente, mas podem não refletir situações específicas.</li>
                                <li>O usuário é responsável por verificar as informações com fontes oficiais.</li>
                            </ul>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Limitação de Responsabilidade</h3>
                            <p>
                                O Salário do Servidor não se responsabiliza por decisões tomadas com base nas simulações realizadas.
                                Os cálculos são oferecidos como ferramenta de apoio e não substituem a consulta a fontes oficiais ou profissionais especializados.
                            </p>
                        </section>

                        {/* Cookies */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="w-6 h-6 text-secondary" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">Cookies e Armazenamento</h2>
                            </div>
                            <p>
                                Atualmente, o Salário do Servidor <strong>não utiliza cookies</strong> para rastrear usuários.
                                Todos os cálculos são realizados localmente no seu navegador e nenhum dado é armazenado em nossos servidores.
                            </p>
                            <p>
                                Caso futuramente implementemos ferramentas de análise para melhorar a experiência do usuário,
                                esta política será atualizada para refletir essas mudanças.
                            </p>
                        </section>

                        {/* Contato */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mt-8">
                            <h3 className="font-bold text-slate-900 dark:text-white m-0 mb-2">Dúvidas?</h3>
                            <p className="text-sm m-0">
                                Entre em contato pelo e-mail: <a href="mailto:contato@salariodoservidor.com.br" className="text-secondary hover:underline">contato@salariodoservidor.com.br</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
