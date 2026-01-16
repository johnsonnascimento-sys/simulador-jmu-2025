import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INITIAL_STATE, CalculatorState, Rubrica, CourtConfig } from '../../types';
import { getCourtBySlug } from '../services/courtService';
import { calculateAll, formatCurrency, getTablesForPeriod, calculateBaseFixa } from '../../utils/calculations';
import { Input, Select } from '../../components/Inputs';
import { Settings, FileText, Calculator as CalculatorIcon, ArrowLeft, Trash2, Plus, Table } from 'lucide-react';
import { Accordion } from '../../components/Accordion';

// Declare standard libs for export logic
declare const jspdf: any;
declare const XLSX: any;

export default function Calculator() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const [courtConfig, setCourtConfig] = useState<CourtConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Fetch Court Config
  useEffect(() => {
    async function fetchConfig() {
      try {
        if (slug) {
          const court = await getCourtBySlug(slug);
          if (court) {
            setCourtConfig(court.config);
          }
        }
      } catch (err) {
        console.error("Failed to load court config", err);
      } finally {
        setLoadingConfig(false);
      }
    }
    fetchConfig();
  }, [slug]);

  // Recalculate whenever inputs change or config loads
  useEffect(() => {
    setState(prev => calculateAll(prev, courtConfig || undefined));
  }, [
    state.periodo, state.cargo, state.padrao, state.funcao,
    state.aqTituloPerc, state.aqTreinoPerc, state.aqTituloVR, state.aqTreinoVR,
    state.recebeAbono, state.gratEspecificaTipo, state.heQtd50, state.heQtd100,
    state.heIsEA, state.manualBaseHE, state.heBase,
    state.substDias, state.substIsEA,
    state.licencaDias, state.baseLicenca, state.incluirAbonoLicenca,
    state.auxPreEscolarQtd, state.cotaPreEscolar, state.auxTransporteGasto,
    state.dependentes, state.regimePrev, state.funprespAliq, state.funprespFacul,
    state.tabelaPSS, state.tabelaIR,
    state.pssSobreFC, state.pssSobreAQTreino,
    state.emprestimos, state.planoSaude, state.pensao,
    state.vpni_lei, state.vpni_decisao, state.ats,
    state.ferias1_3, state.feriasAntecipadas, state.manualFerias,
    state.adiant13Venc, state.adiant13FC, state.manualAdiant13,
    state.incidirPSSGrat,
    state.diariasQtd, state.diariasMeiaQtd, state.diariasEmbarque,
    state.diariasDescontarAlimentacao, state.diariasDescontarTransporte,
    state.diariasExtHospedagem, state.diariasExtAlimentacao, state.diariasExtTransporte,
    courtConfig
  ]);

  const update = (field: keyof CalculatorState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const updateSubstDays = (key: string, days: number) => {
    setState(prev => ({
      ...prev,
      substDias: { ...prev.substDias, [key]: days }
    }));
  };

  const setToday = () => {
    const now = new Date();
    const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    setState(prev => ({
      ...prev,
      mesRef: months[now.getMonth()],
      anoRef: now.getFullYear()
    }));
  };

  const handleCalcFerias = () => {
    const tables = getTablesForPeriod(state.periodo, courtConfig || undefined);
    const { totalComFC } = calculateBaseFixa(state, tables.funcoes, tables.salario, tables.valorVR);
    update('ferias1_3', totalComFC / 3);
  };

  const handleCalc13Manual = () => {
    const tables = getTablesForPeriod(state.periodo, courtConfig || undefined);
    const { baseSemFC, funcaoValor } = calculateBaseFixa(state, tables.funcoes, tables.salario, tables.valorVR);
    setState(prev => ({
      ...prev,
      adiant13Venc: baseSemFC / 2,
      adiant13FC: funcaoValor / 2
    }));
  };

  const addRubrica = () => {
    const newRubrica: Rubrica = {
      id: Math.random().toString(36).substr(2, 9),
      descricao: '',
      valor: 0,
      tipo: 'C'
    };
    setState(prev => ({
      ...prev,
      rubricasExtras: [...prev.rubricasExtras, newRubrica]
    }));
  };

  const removeRubrica = (id: string) => {
    setState(prev => ({
      ...prev,
      rubricasExtras: prev.rubricasExtras.filter(r => r.id !== id)
    }));
  };

  const updateRubrica = (id: string, field: keyof Rubrica, value: any) => {
    setState(prev => ({
      ...prev,
      rubricasExtras: prev.rubricasExtras.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const handleTipoCalculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTipo = e.target.value;
    let updates: Partial<CalculatorState> = { tipoCalculo: newTipo };

    if (newTipo === 'jan') updates.mesRef = 'JANEIRO';
    if (newTipo === 'jun') updates.mesRef = 'JUNHO';
    if (newTipo === 'nov') updates.mesRef = 'NOVEMBRO';

    const tables = getTablesForPeriod(state.periodo, courtConfig || undefined);
    const { baseSemFC, totalComFC, funcaoValor } = calculateBaseFixa(state, tables.funcoes, tables.salario, tables.valorVR);

    if (newTipo === 'jan') {
      updates.ferias1_3 = totalComFC / 3;
      updates.adiant13Venc = baseSemFC / 2;
      updates.adiant13FC = funcaoValor / 2;
      updates.manualFerias = false;
      updates.manualAdiant13 = false;
      updates.feriasAntecipadas = true;
    } else if (newTipo === 'jun') {
      updates.adiant13Venc = baseSemFC / 2;
      updates.adiant13FC = funcaoValor / 2;
      updates.manualAdiant13 = false;
    } else if (newTipo === 'nov') {
      updates.adiant13Venc = baseSemFC / 2;
      updates.adiant13FC = funcaoValor / 2;
      updates.manualAdiant13 = false;
      updates.manualDecimoTerceiroNov = false;
    } else if (newTipo === 'comum') {
      updates.ferias1_3 = 0;
      updates.adiant13Venc = 0;
      updates.adiant13FC = 0;
      updates.manualFerias = false;
      updates.manualAdiant13 = false;
    }

    setState(prev => ({ ...prev, ...updates }));
  };

  const resultRows = useMemo(() => {
    const rows: Array<{ label: string; value: number; type: 'C' | 'D' }> = [];
    const isNovoAQ = state.periodo >= 1;

    // Proventos
    if (state.vencimento > 0) rows.push({ label: 'VENCIMENTO-ATIVO EC', value: state.vencimento, type: 'C' });
    if (state.gaj > 0) rows.push({ label: 'GRAT. ATIV. JUD. (GAJ)', value: state.gaj, type: 'C' });

    if (state.gratEspecificaValor > 0) {
      const label = state.gratEspecificaTipo === 'gae' ? 'GRATIFICAÇÃO DE ATIVIDADE EXTERNA (GAE)' : 'GRATIFICAÇÃO DE ATIVIDADE DE SEGURANÇA (GAS)';
      rows.push({ label: label, value: state.gratEspecificaValor, type: 'C' });
    }

    if (state.aqTituloValor > 0) {
      const label = isNovoAQ ? 'AQ TÍTULOS (LEI 15.292)' : 'ADICIONAL QUALIFICAÇÃO (TÍTULO)';
      rows.push({ label, value: state.aqTituloValor, type: 'C' });
    }
    if (state.aqTreinoValor > 0) {
      const label = isNovoAQ ? 'AQ TREINAMENTO (LEI 15.292)' : 'ADICIONAL QUALIFICAÇÃO (TREINAMENTO)';
      rows.push({ label, value: state.aqTreinoValor, type: 'C' });
    }

    if (state.funcao !== '0') {
      const tables = getTablesForPeriod(state.periodo, courtConfig || undefined);
      const valorFC = tables.funcoes[state.funcao] || 0;
      let labelTipo = "FUNÇÃO COMISSIONADA (OPÇÃO)";
      if (state.funcao.startsWith('cj')) labelTipo = "CARGO EM COMISSÃO";
      rows.push({ label: `${labelTipo} - ${state.funcao.toUpperCase()}`, value: valorFC, type: 'C' });
    }

    if (state.substTotal > 0) rows.push({ label: `SUBSTITUIÇÃO DE FUNÇÃO${state.substIsEA ? ' (EA)' : ''}`, value: state.substTotal, type: 'C' });
    if (state.heTotal > 0) rows.push({ label: `SERVIÇO EXTRAORDINÁRIO${state.heIsEA ? ' (EA)' : ''}`, value: state.heTotal, type: 'C' });
    if (state.vpni_lei > 0) rows.push({ label: 'VPNI - LEI 9.527/97', value: state.vpni_lei, type: 'C' });
    if (state.vpni_decisao > 0) rows.push({ label: 'VPNI - DECISÃO JUDICIAL', value: state.vpni_decisao, type: 'C' });
    if (state.ats > 0) rows.push({ label: 'ADICIONAL TEMPO DE SERVIÇO', value: state.ats, type: 'C' });
    if (state.auxAlimentacao > 0) rows.push({ label: 'AUXÍLIO-ALIMENTAÇÃO', value: state.auxAlimentacao, type: 'C' });
    if (state.auxPreEscolarValor > 0) rows.push({ label: 'AUXÍLIO PRÉ-ESCOLAR', value: state.auxPreEscolarValor, type: 'C' });
    if (state.auxTransporteValor > 0) rows.push({ label: 'AUXÍLIO-TRANSPORTE', value: state.auxTransporteValor, type: 'C' });
    if (state.licencaValor > 0) rows.push({ label: 'INDENIZAÇÃO LICENÇA COMPENSATÓRIA', value: state.licencaValor, type: 'C' });
    if (state.abonoPermanencia > 0) rows.push({ label: 'ABONO DE PERMANÊNCIA', value: state.abonoPermanencia, type: 'C' });
    if (state.ferias1_3 > 0) rows.push({ label: 'ADICIONAL 1/3 FÉRIAS', value: state.ferias1_3, type: 'C' });

    if (state.tipoCalculo === 'nov') {
      if (state.gratNatalinaTotal && state.gratNatalinaTotal > 0) {
        rows.push({ label: 'GRATIFICAÇÃO NATALINA-ATIVO EC', value: state.gratNatalinaTotal, type: 'C' });
      }
      if (state.abonoPerm13 && state.abonoPerm13 > 0) {
        rows.push({ label: 'ABONO DE PERMANÊNCIA-GN (13º) EC 41/2003 ATIVO EC', value: state.abonoPerm13, type: 'C' });
      }
      if (state.adiant13Venc > 0) {
        rows.push({ label: 'GRATIFICAÇÃO NATALINA-ADIANT. ATIVO EC', value: state.adiant13Venc, type: 'D' });
      }
      if (state.adiant13FC > 0) {
        rows.push({ label: 'GRATIFICAÇÃO NATALINA-ADIANT. FC/CJ ATIVO EC', value: state.adiant13FC, type: 'D' });
      }
    } else {
      if (state.adiant13Venc > 0) rows.push({ label: 'GRATIFICAÇÃO NATALINA-ADIANT. ATIVO EC', value: state.adiant13Venc, type: 'C' });
      if (state.adiant13FC > 0) rows.push({ label: 'GRATIFICAÇÃO NATALINA-ADIANT. FC/CJ ATIVO EC', value: state.adiant13FC, type: 'C' });
    }

    // Descontos
    if (state.pssMensal > 0) rows.push({ label: 'CONTRIBUIÇÃO RPPS (PSS)', value: state.pssMensal, type: 'D' });
    if (state.valFunpresp > 0) rows.push({ label: 'FUNPRESP-JUD', value: state.valFunpresp, type: 'D' });
    if (state.irMensal > 0) rows.push({ label: 'IMPOSTO DE RENDA-EC', value: state.irMensal, type: 'D' });
    if (state.irEA > 0) rows.push({ label: 'IMPOSTO DE RENDA-EA', value: state.irEA, type: 'D' });
    if (state.irFerias > 0) rows.push({ label: 'IMPOSTO DE RENDA (FÉRIAS)', value: state.irFerias, type: 'D' });
    if (state.feriasDesc && state.feriasDesc > 0) rows.push({ label: 'ADICIONAL 1/3 DE FÉRIAS (ANTECIPADO)', value: state.feriasDesc, type: 'D' });
    if (state.pss13 && state.pss13 > 0) rows.push({ label: 'CONTRIBUIÇÃO RPPS-GN(13º) ATIVO EC', value: state.pss13, type: 'D' });
    if (state.ir13 && state.ir13 > 0) rows.push({ label: 'IMPOSTO DE RENDA-GN(13º) EC', value: state.ir13, type: 'D' });
    if (state.auxTransporteDesc > 0) rows.push({ label: 'COTA-PARTE AUXÍLIO-TRANSPORTE', value: state.auxTransporteDesc, type: 'D' });
    if (state.emprestimos > 0) rows.push({ label: 'CONSIGNAÇÕES / EMPRÉSTIMOS', value: state.emprestimos, type: 'D' });
    if (state.planoSaude > 0) rows.push({ label: 'PLANO DE SAÚDE', value: state.planoSaude, type: 'D' });
    if (state.pensao > 0) rows.push({ label: 'PENSÃO ALIMENTÍCIA', value: state.pensao, type: 'D' });

    // Diárias/Indenizações
    if (state.diariasBruto > 0) rows.push({ label: 'DIÁRIAS', value: state.diariasBruto, type: 'C' });
    if (state.diariasDescAlim > 0) rows.push({ label: 'RESTITUIÇÃO AUX. ALIM. (DIÁRIAS)', value: state.diariasDescAlim, type: 'D' });
    if (state.diariasDescTransp > 0) rows.push({ label: 'RESTITUIÇÃO AUX. TRANSP. (DIÁRIAS)', value: state.diariasDescTransp, type: 'D' });

    const glosaEst = state.diariasBruto - state.diariasValorTotal - state.diariasDescAlim - state.diariasDescTransp;
    if (glosaEst > 0.01) rows.push({ label: 'ABATIMENTO BENEF. EXTERNO (ART. 4)', value: glosaEst, type: 'D' });

    state.rubricasExtras.forEach(r => {
      if (r.valor > 0 && r.descricao) {
        rows.push({ label: r.descricao.toUpperCase(), value: r.valor, type: r.tipo });
      }
    });

    return rows;
  }, [state]);

  const handleExportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PODER JUDICIÁRIO", 105, 15, { align: "center" });
    doc.text("JUSTIÇA MILITAR DA UNIÃO", 105, 22, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Demonstrativo de Pagamento Simulado - Ref: ${state.mesRef}/${state.anoRef}`, 105, 30, { align: "center" });
    doc.text(`Servidor: ${state.nome || "SERVIDOR SIMULADO"}`, 14, 40);

    const tableBody = resultRows.map(row => [
      row.type === 'C' ? 'C' : 'D',
      row.label,
      row.type === 'C' ? formatCurrency(row.value) : '',
      row.type === 'D' ? formatCurrency(row.value) : ''
    ]);
    tableBody.push(['', 'TOTAL', formatCurrency(state.totalBruto), formatCurrency(state.totalDescontos)]);

    doc.autoTable({
      head: [['TIPO', 'RUBRICA', 'PROVENTOS', 'DESCONTOS']],
      body: tableBody,
      startY: 48,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'right', textColor: [0, 100, 0] },
        3: { halign: 'right', textColor: [180, 0, 0] }
      },
      didParseCell: function (data: any) {
        if (data.section === 'body' && data.row.index === tableBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`LÍQUIDO A RECEBER: ${formatCurrency(state.liquido)}`, 195, finalY, { align: "right" });

    if (state.observacoes) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const splitObs = doc.splitTextToSize(`OBS: ${state.observacoes}`, 180);
      doc.text(splitObs, 14, finalY + 10);
    }
    doc.save(`Holerite_${state.mesRef}_${state.anoRef}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["PODER JUDICIÁRIO - JUSTIÇA MILITAR DA UNIÃO"],
      [`SIMULAÇÃO DE SALÁRIO - REF: ${state.mesRef}/${state.anoRef}`],
      [`NOME: ${state.nome}`],
      [""],
      ["TIPO", "RUBRICA", "PROVENTOS", "DESCONTOS"]
    ];
    resultRows.forEach(row => {
      wsData.push([
        row.type,
        row.label,
        row.type === 'C' ? row.value : "",
        row.type === 'D' ? row.value : ""
      ]);
    });
    wsData.push(["", "TOTAL", state.totalBruto, state.totalDescontos]);
    wsData.push(["", "LÍQUIDO", "", state.liquido]);
    if (state.observacoes) {
      wsData.push([""]);
      wsData.push(["OBS:", state.observacoes]);
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Holerite");
    XLSX.writeFile(wb, `Holerite_${state.mesRef}.xlsx`);
  };

  const currentTables = getTablesForPeriod(state.periodo, courtConfig || undefined);
  const isNovoAQ = state.periodo >= 1;

  if (loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
      {/* Header and Title */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <button onClick={() => navigate('/')} className="bg-white dark:bg-slate-800 p-2 rounded-xl text-slate-500 hover:text-secondary card-shadow transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {courtConfig ? (courtConfig.values?.cj1_integral_base ? 'Simulador JMU' : courtConfig.name) : 'Simulador'}
            </h1>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {state.periodo === 0 ? 'Tabelas 2025' : 'Projeção Futura'}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nome para impressão (Opcional)"
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none card-shadow"
            value={state.nome}
            onChange={e => {
              const val = e.target.value;
              if (val === 'Johnson*') {
                setState(prev => ({ ...prev, nome: val, planoSaude: 928.52, emprestimos: 3761.63 }));
              } else {
                update('nome', val);
              }
            }}
          />
          <button onClick={handleExportPDF} className="bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-xl card-shadow transition-colors" title="Baixar PDF">
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Global Config Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 card-shadow mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configurações Globais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ref. Salarial</label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
              value={state.periodo}
              onChange={(e) => update('periodo', Number(e.target.value))}
            >
              <option value={0}>Fev/2025 a Dez/2025 (Atual)</option>
              <option value={1}>Jan/2026 a Jun/2026 (Novo AQ)</option>
              <option value={2}>Jul/2026 a Jun/2027 (+8%)</option>
              <option value={3}>Jul/2027 a Jun/2028 (+8% Acum.)</option>
              <option value={4}>Jul/2028 em diante (+8% Acum.)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mês de Referência (PDF)</label>
            <div className="flex gap-2">
              <select
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
                value={state.mesRef}
                onChange={e => update('mesRef', e.target.value)}
              >
                {["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
                value={state.anoRef}
                onChange={e => update('anoRef', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Cálculo</label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
              value={state.tipoCalculo}
              onChange={handleTipoCalculoChange}
            >
              <option value="comum">Mês Comum</option>
              <option value="jan">Janeiro (Adiant. 13º + Férias Dez)</option>
              <option value="jun">Junho (1ª Parc. 13º)</option>
              <option value="nov">Novembro (2ª Parc. 13º)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Column 1: Fixed Earnings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 card-shadow">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">attach_money</span>Rendimentos Fixos
            </h3>

            {/* Cargo */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={state.cargo} onChange={e => update('cargo', e.target.value)}>
                    <option value="tec">Técnico</option>
                    <option value="analista">Analista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Classe/Padrão</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={state.padrao} onChange={e => update('padrao', e.target.value)}>
                    {Object.keys(currentTables.salario[state.cargo]).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">FC / CJ</label>
                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={state.funcao} onChange={e => update('funcao', e.target.value)}>
                  <option value="0">Sem Função / Manual</option>
                  {Object.keys(currentTables.funcoes).map(f => (
                    <option key={f} value={f}>{f.toUpperCase()} - {formatCurrency(currentTables.funcoes[f])}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AQ Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 flex justify-between">
                Adicional Qualificação
                <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{isNovoAQ ? 'LEI 15.292/2026' : 'REGRA ATUAL'}</span>
              </h4>

              {isNovoAQ ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Títulos (Base: VR)</label>
                    <select className="w-full rounded-lg border-slate-200 text-sm py-1.5" value={state.aqTituloVR} onChange={e => update('aqTituloVR', Number(e.target.value))}>
                      <option value={0}>Nenhum</option>
                      <option value={1}>1x Esp. (1 VR)</option>
                      <option value={2}>2x Esp. (2 VR)</option>
                      <option value={3.5}>Mestrado (3.5 VR)</option>
                      <option value={5}>Doutorado (5 VR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Treinamento</label>
                    <select className="w-full rounded-lg border-slate-200 text-sm py-1.5" value={state.aqTreinoVR} onChange={e => update('aqTreinoVR', Number(e.target.value))}>
                      <option value={0}>0h</option>
                      <option value={0.2}>120h (0.2 VR)</option>
                      <option value={0.4}>240h (0.4 VR)</option>
                      <option value={0.6}>360h (0.6 VR)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Títulos (Base: VB)</label>
                    <select className="w-full rounded-lg border-slate-200 text-sm py-1.5" value={state.aqTituloPerc} onChange={e => update('aqTituloPerc', Number(e.target.value))}>
                      <option value={0}>Nenhum</option>
                      <option value={0.05}>Graduação (5%)</option>
                      <option value={0.075}>Especialização (7.5%)</option>
                      <option value={0.10}>Mestrado (10%)</option>
                      <option value={0.125}>Doutorado (12.5%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Treinamento</label>
                    <select className="w-full rounded-lg border-slate-200 text-sm py-1.5" value={state.aqTreinoPerc} onChange={e => update('aqTreinoPerc', Number(e.target.value))}>
                      <option value={0}>0h</option>
                      <option value={0.01}>120h (1%)</option>
                      <option value={0.02}>240h (2%)</option>
                      <option value={0.03}>360h (3%)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Accordions for Extras */}
            <div className="space-y-2">
              <Accordion title="Gratificação (GAE/GAS)" className="bg-amber-50 rounded-lg" headerClassName="px-4 py-3 text-amber-900 font-bold text-sm" contentClassName="px-4 py-3 border-t border-amber-100">
                <select className="w-full rounded border-amber-200 text-sm mb-2" value={state.gratEspecificaTipo} onChange={e => update('gratEspecificaTipo', e.target.value)}>
                  <option value="0">Nenhuma</option>
                  <option value="gae">GAE (Oficial de Justiça)</option>
                  <option value="gas">GAS (Agente de Polícia)</option>
                </select>
                <label className="flex items-center gap-2 text-xs text-amber-900">
                  <input type="checkbox" checked={state.incidirPSSGrat} onChange={e => update('incidirPSSGrat', e.target.checked)} className="rounded text-amber-600" />
                  Incidir PSS?
                </label>
              </Accordion>

              <Accordion title="Vantagens Pessoais" className="bg-rose-50 rounded-lg" headerClassName="px-4 py-3 text-rose-900 font-bold text-sm" contentClassName="px-4 py-3 border-t border-rose-100 space-y-2">
                <div>
                  <label className="text-[10px] text-rose-800 uppercase font-bold">VPNI (Lei 9.527)</label>
                  <input type="number" className="w-full rounded border-rose-200 text-sm" value={state.vpni_lei} onChange={e => update('vpni_lei', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[10px] text-rose-800 uppercase font-bold">VPNI (Decisão)</label>
                  <input type="number" className="w-full rounded border-rose-200 text-sm" value={state.vpni_decisao} onChange={e => update('vpni_decisao', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[10px] text-rose-800 uppercase font-bold">ATS (Anuênios)</label>
                  <input type="number" className="w-full rounded border-rose-200 text-sm" value={state.ats} onChange={e => update('ats', Number(e.target.value))} />
                </div>
              </Accordion>

              <Accordion title="Abono de Permanência" className="bg-green-50 rounded-lg" headerClassName="px-4 py-3 text-green-900 font-bold text-sm" contentClassName="px-4 py-3 border-t border-green-100">
                <label className="flex items-center gap-2 text-sm text-green-900 cursor-pointer">
                  <input type="checkbox" checked={state.recebeAbono} onChange={e => update('recebeAbono', e.target.checked)} className="rounded text-green-600" />
                  Recebo Abono?
                </label>
                {state.recebeAbono && <p className="text-xs text-green-700 mt-1 font-bold">Valor: {formatCurrency(state.abonoPermanencia)}</p>}
              </Accordion>
            </div>

          </div>
        </div>

        {/* Column 2: Variable Earnings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 card-shadow">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add_circle</span>Rendimentos Variáveis
            </h3>

            <div className="space-y-3">

              {/* Férias */}
              <Accordion title="Férias" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-slate-700" contentClassName="p-4 border-t border-slate-100">
                <label className="flex items-center gap-2 mb-3 text-xs font-bold text-secondary uppercase cursor-pointer">
                  <input type="checkbox" checked={state.manualFerias} onChange={e => update('manualFerias', e.target.checked)} className="rounded text-secondary" />
                  Editar Valor
                </label>
                <input
                  className={`w-full rounded-lg border-slate-200 text-sm mb-3 ${state.manualFerias ? 'bg-white' : 'bg-slate-50 text-slate-500'}`}
                  value={state.ferias1_3}
                  onChange={e => update('ferias1_3', Number(e.target.value))}
                  readOnly={!state.manualFerias}
                  type="number"
                />
                <button onClick={handleCalcFerias} className="w-full bg-secondary/10 text-secondary text-xs font-bold py-2 rounded-lg hover:bg-secondary/20 transition mb-3">
                  Calcular 1/3 Automático
                </button>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={state.feriasAntecipadas} onChange={e => update('feriasAntecipadas', e.target.checked)} className="rounded text-secondary" />
                  Recebi mês passado? (Desconto)
                </label>
              </Accordion>

              {/* 13º Salário */}
              <Accordion title="13º Salário (Adiantamento)" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-slate-700" contentClassName="p-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Vencimento</label>
                    <input type="number" className="w-full rounded border-slate-200 text-sm" value={state.adiant13Venc} onChange={e => update('adiant13Venc', Number(e.target.value))} readOnly={!state.manualAdiant13} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">FC/CJ</label>
                    <input type="number" className="w-full rounded border-slate-200 text-sm" value={state.adiant13FC} onChange={e => update('adiant13FC', Number(e.target.value))} readOnly={!state.manualAdiant13} />
                  </div>
                </div>
                <button onClick={handleCalc13Manual} className="w-full bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 transition">
                  Calcular Automático
                </button>
                <div className="mt-3 flex gap-2">
                  <label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={state.manualAdiant13} onChange={e => update('manualAdiant13', e.target.checked)} className="rounded text-secondary" />
                    Manual
                  </label>
                </div>
              </Accordion>

              {/* Horas Extras */}
              <Accordion title="Horas Extras" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-slate-700" contentClassName="p-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={state.heIsEA} onChange={e => update('heIsEA', e.target.checked)} className="rounded text-secondary" />
                    Pagamento como EA?
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase cursor-pointer">
                    <input type="checkbox" checked={state.manualBaseHE} onChange={e => update('manualBaseHE', e.target.checked)} className="rounded text-secondary" />
                    Editar manualmente
                  </label>
                </div>

                <div className="mb-3">
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Base de Cálculo HE</label>
                  <input
                    type="number"
                    className={`w-full rounded-lg border-slate-200 text-sm ${state.manualBaseHE ? 'bg-white' : 'bg-slate-50 text-slate-500'}`}
                    value={state.heBase || ''}
                    disabled={!state.manualBaseHE}
                    onChange={e => update('heBase', Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Qtd 50%</label>
                    <input type="number" className="w-full rounded border-slate-200 text-sm" value={state.heQtd50} onChange={e => update('heQtd50', Number(e.target.value))} />
                    <div className="text-xs text-slate-500 mt-1">{formatCurrency(state.heVal50)}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Qtd 100%</label>
                    <input type="number" className="w-full rounded border-slate-200 text-sm" value={state.heQtd100} onChange={e => update('heQtd100', Number(e.target.value))} />
                    <div className="text-xs text-slate-500 mt-1">{formatCurrency(state.heVal100)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Total HE</span>
                  <span className="text-sm font-bold text-slate-700">{formatCurrency(state.heTotal)}</span>
                </div>
              </Accordion>

              {/* Substituição RESTORED */}
              <Accordion title="Substituição" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-orange-700" contentClassName="p-4 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs mb-3">
                  <input type="checkbox" checked={state.substIsEA} onChange={e => update('substIsEA', e.target.checked)} className="rounded text-orange-500 focus:ring-orange-500" />
                  <span className="text-slate-700">Pagamento como EA?</span>
                </label>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {['fc1', 'fc2', 'fc3', 'fc4', 'fc5', 'fc6', 'cj1', 'cj2', 'cj3', 'cj4'].map(key => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 w-8 uppercase">{key.replace(/(\d+)/, '-$1')}</span>
                      <div className="flex items-center">
                        <input
                          type="number"
                          placeholder="Dias"
                          className="w-16 h-7 rounded border-slate-200 bg-white text-xs text-center focus:ring-orange-500 focus:border-orange-500"
                          value={state.substDias[key] || ''}
                          onChange={e => updateSubstDays(key, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right text-xs font-bold text-orange-600 mt-3">Total Estimado: {formatCurrency(state.substTotal)}</div>
              </Accordion>

              {/* Licença Compensatória RESTORED */}
              <Accordion title="Licença Compensatória" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-teal-700" contentClassName="p-4 border-t border-slate-100">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Função Base</label>
                    <select className="w-full rounded-md border-slate-200 bg-white text-xs" value={state.baseLicenca} onChange={e => update('baseLicenca', e.target.value)}>
                      <option value="auto">Minha Função Atual (Titular)</option>
                      <option value="cj4">Substituição de CJ-4</option>
                      <option value="cj3">Substituição de CJ-3</option>
                      <option value="cj2">Substituição de CJ-2</option>
                      <option value="cj1">Substituição de CJ-1</option>
                      <option value="fc6">Substituição de FC-6</option>
                    </select>
                  </div>
                  <label className="flex items-start gap-2 text-xs">
                    <input type="checkbox" checked={state.incluirAbonoLicenca} onChange={e => update('incluirAbonoLicenca', e.target.checked)} className="rounded text-teal-600 mt-0.5" />
                    <span className="text-slate-700">Incluir Abono na Base?</span>
                  </label>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Qtd. Dias a Indenizar</label>
                    <input type="number" value={state.licencaDias} onChange={e => update('licencaDias', Number(e.target.value))} className="w-full rounded border-slate-200" />
                  </div>
                </div>
                <div className="mt-3 bg-teal-50 p-2 rounded flex justify-between items-center border border-teal-100">
                  <span className="text-xs font-medium text-teal-800">Total (Isento)</span>
                  <span className="text-sm font-bold text-teal-700">{formatCurrency(state.licencaValor)}</span>
                </div>
              </Accordion>

              {/* Diárias de Viagem */}
              <Accordion title="Diárias de Viagem" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-indigo-700" contentClassName="p-4 border-t border-slate-100">
                <div className="mb-4 text-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade de Diárias</label>
                  <input type="number" step="0.5" className="w-24 text-center rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={state.diariasQtd} onChange={e => update('diariasQtd', Number(e.target.value))} />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adicional de Embarque</label>
                  <select className="w-full rounded-lg border-slate-200 text-sm" value={state.diariasEmbarque} onChange={e => update('diariasEmbarque', e.target.value)}>
                    <option value="nao">Não</option>
                    <option value="metade">Ida OU Volta (50%)</option>
                    <option value="completo">Ida E Volta (100%)</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                  <p className="text-xs font-bold text-indigo-800 mb-2">Abatimentos (Art. 4º)</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={state.diariasExtHospedagem} onChange={e => update('diariasExtHospedagem', e.target.checked)} className="rounded text-indigo-600" />
                      Hospedagem (55%)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={state.diariasExtAlimentacao} onChange={e => update('diariasExtAlimentacao', e.target.checked)} className="rounded text-indigo-600" />
                      Alimentação (25%)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={state.diariasExtTransporte} onChange={e => update('diariasExtTransporte', e.target.checked)} className="rounded text-indigo-600" />
                      Transporte (20%)
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input type="checkbox" checked={state.diariasDescontarAlimentacao} onChange={e => update('diariasDescontarAlimentacao', e.target.checked)} className="rounded text-slate-400" />
                    Restituir Aux. Alimentação?
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input type="checkbox" checked={state.diariasDescontarTransporte} onChange={e => update('diariasDescontarTransporte', e.target.checked)} className="rounded text-slate-400" />
                    Restituir Aux. Transporte?
                  </label>
                </div>

                {state.diariasValorTotal > 0 && (
                  <div className="mt-4 bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                    <h5 className="text-xs font-bold text-indigo-800 mb-2 uppercase border-b border-indigo-200 pb-1">Extrato Estimado</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>(+) Diárias (Bruto)</span>
                        <span>{formatCurrency(state.diariasBruto - (state.diariasEmbarque === 'completo' ? 586.78 : state.diariasEmbarque === 'metade' ? 293.39 : 0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>(+) Adicional de Embarque</span>
                        <span>{formatCurrency(state.diariasEmbarque === 'completo' ? 586.78 : state.diariasEmbarque === 'metade' ? 293.39 : 0)}</span>
                      </div>

                      {/* Estimate of External Deduction (Glosa) */}
                      {(state.diariasExtHospedagem || state.diariasExtAlimentacao || state.diariasExtTransporte) && (
                        <div className="flex justify-between text-rose-600">
                          <span>(-) Abatimento Benef. Externo</span>
                          <span>- {formatCurrency(state.diariasBruto - state.diariasValorTotal - state.diariasDescAlim - state.diariasDescTransp).replace('R$', '').trim()}</span>
                        </div>
                      )}

                      {state.diariasDescontarAlimentacao && (
                        <div className="flex justify-between text-rose-600">
                          <span>(-) Restituição Aux. Alimentação</span>
                          <span>- {formatCurrency(state.diariasDescAlim)}</span>
                        </div>
                      )}
                      {state.diariasDescontarTransporte && (
                        <div className="flex justify-between text-rose-600">
                          <span>(-) Restituição Aux. Transporte</span>
                          <span>- {formatCurrency(state.diariasDescTransp)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-indigo-900 font-bold pt-2 border-t border-indigo-200 mt-2 text-sm">
                        <span>(=) Total Líquido Diárias</span>
                        <span>{formatCurrency(state.diariasValorTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Accordion>

              {/* Auxílios Combined & Detailed */}
              <div className="space-y-2">
                {/* Alimentação */}
                <Accordion title="Auxílio Alimentação" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-blue-700" contentClassName="p-4 border-t border-slate-100">
                  <select
                    className="w-full rounded border-slate-200 text-sm mb-2"
                    value={state.auxAlimentacao}
                    onChange={e => update('auxAlimentacao', Number(e.target.value))}
                  >
                    {courtConfig?.menus?.food_allowance ? (
                      courtConfig.menus.food_allowance.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))
                    ) : (
                      <>
                        <option value={1784.42}>1.784,42 (Atual)</option>
                        <option value={1460.40}>1.460,40</option>
                        <option value={1300.00}>1.300,00</option>
                        <option value={1235.77}>1.235,77</option>
                      </>
                    )}
                  </select>
                </Accordion>

                {/* Pré-Escolar */}
                <Accordion title="Auxílio Pré-Escolar" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-blue-700" contentClassName="p-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Cota</label>
                      <select
                        className="w-full rounded border-slate-200 text-xs"
                        value={state.cotaPreEscolar}
                        onChange={e => update('cotaPreEscolar', Number(e.target.value))}
                      >
                        {courtConfig?.menus?.preschool_allowance ? (
                          courtConfig.menus.preschool_allowance.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))
                        ) : (
                          <>
                            <option value={1235.77}>1.235,77 (Atual)</option>
                            <option value={1178.82}>1.178,82</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Qtd</label>
                      <input className="w-full rounded border-slate-200 text-xs text-center" type="number" value={state.auxPreEscolarQtd} onChange={e => update('auxPreEscolarQtd', Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs font-bold text-blue-800">Total: {formatCurrency(state.auxPreEscolarValor)}</span>
                  </div>
                </Accordion>

                {/* Transporte */}
                <Accordion title="Auxílio Transporte" className="bg-white border border-slate-200 rounded-xl" headerClassName="px-4 py-3 font-bold text-sm text-blue-700" contentClassName="p-4 border-t border-slate-100">
                  <label className="text-[10px] text-slate-500 block mb-1">Valor Mensal (Gasto)</label>
                  <input
                    className="w-full rounded border-slate-200 text-sm"
                    type="number"
                    value={state.auxTransporteGasto}
                    onChange={e => update('auxTransporteGasto', Number(e.target.value))}
                  />
                  {state.auxTransporteGasto > 0 && state.auxTransporteValor === 0 && (
                    <p className="text-[10px] text-red-500 mt-1 font-bold">Cancelado (Desconto &gt; Gasto).</p>
                  )}
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Deductions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 card-shadow">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">horizontal_rule</span>Descontos
            </h3>

            {/* Section 1: Tabelas de Tributação (Normalized) */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-left">Tabelas de Tributação (Vigência)</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Tabela PSS</label>
                  <select className="w-full rounded-lg border-slate-200 text-sm py-1.5 bg-white focus:ring-secondary focus:border-secondary" value={state.tabelaPSS} onChange={e => update('tabelaPSS', e.target.value)}>
                    <option value="2026">2026 (Est.)</option>
                    <option value="2025">Portaria MPS/MF 14</option>
                    <option value="2024">2024 (Antiga)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Tabela IR (Lei 11.482)</label>
                  <select className="w-full rounded-lg border-slate-200 text-sm py-1.5 bg-white focus:ring-secondary focus:border-secondary" value={state.tabelaIR} onChange={e => update('tabelaIR', e.target.value)}>
                    <option value="2025_maio">Maio/2025</option>
                    <option value="2024_fev">Fev/2024</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Dedução Dep. (Lei 9250)</label>
                  <div className="text-sm font-medium text-slate-700 py-1.5 px-3 bg-white border border-slate-200 rounded-lg">R$ 189,59</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Dependentes IR</label>
                  <input type="number" className="w-full rounded-lg border-slate-200 text-sm py-1.5 text-center focus:ring-secondary focus:border-secondary" value={state.dependentes} onChange={e => update('dependentes', Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Section 2: Regime de Previdência (Normalized) */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-left">Regime de Previdência / Ingresso</h4>
              <select className="w-full rounded-lg border-slate-200 text-sm py-2 mb-2 bg-white focus:ring-secondary focus:border-secondary" value={state.regimePrev} onChange={e => update('regimePrev', e.target.value)}>
                <option value="antigo">Antes de 2013 / Regime Antigo (Integral)</option>
                <option value="migrado">Antes de 2013 (Migrado - Teto)</option>
                <option value="novo_antigo">Após 2013 (Integral - Raro)</option>
                <option value="rpc">Após 2013 (RPC - Teto)</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-slate-600 mt-2 cursor-pointer">
                <input type="checkbox" checked={state.pssSobreFC} onChange={e => update('pssSobreFC', e.target.checked)} className="rounded border-slate-300 text-slate-600 focus:ring-slate-200" />
                Incidir PSS sobre FC/CJ
              </label>
              {state.regimePrev !== 'antigo' && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Funpresp</label>
                    <select className="w-full text-xs rounded border-slate-200 focus:ring-secondary focus:border-secondary" value={state.funprespAliq} onChange={e => update('funprespAliq', Number(e.target.value))}>
                      <option value={0}>Não</option>
                      <option value={0.065}>6.5%</option>
                      <option value={0.075}>7.5%</option>
                      <option value={0.085}>8.5%</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Facultativa (%)</label>
                    <input type="number" className="w-full text-xs rounded border-slate-200 focus:ring-secondary focus:border-secondary" value={state.funprespFacul} onChange={e => update('funprespFacul', Number(e.target.value))} />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Deduções Calculadas (Normalized) */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-left">Deduções Calculadas</h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* PSS */}
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">PSS Mensal (RPPS)</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(state.pssMensal)}</span>
                </div>
                {/* Funpresp */}
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">Funpresp</span>
                  <span className="text-sm font-bold text-purple-600">{formatCurrency(state.valFunpresp)}</span>
                </div>
                {/* IRRF Salário */}
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">IRRF (Salário)</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(state.irMensal)}</span>
                </div>
                {/* IRRF RRA/Ant */}
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">IRRF (RRA/Ant.)</span>
                  <span className="text-sm font-bold text-slate-700">{formatCurrency(0)}</span>
                </div>
                {/* IRRF Férias */}
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">IRRF Férias</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(state.irFerias)}</span>
                </div>
                {/* Cota Transporte */}
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">Cota-Parte Transporte</span>
                  <span className="text-sm font-bold text-orange-600">{formatCurrency(state.auxTransporteDesc)}</span>
                </div>
              </div>

              {/* Adicional 1/3 Férias (Antecipado) - Full Width */}
              {state.feriasDesc > 0 && (
                <div className="mb-3 p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-bold text-red-700 mb-1">Adicional 1/3 de Férias (Antecipado)</span>
                  <span className="text-lg font-bold text-red-700">{formatCurrency(state.feriasDesc)}</span>
                </div>
              )}

              {/* 13º Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">PSS sobre 13º</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(state.pss13)}</span>
                </div>
                <div className="p-3 border border-slate-200 bg-white rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 mb-1">IRRF sobre 13º</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(state.ir13)}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Outros Descontos (Consignações) */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Outros Descontos (Opcionais)</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-500">Empréstimos</label>
                  <div className="w-32">
                    <input type="text" className="w-full rounded border-slate-200 text-xs text-right focus:ring-secondary focus:border-secondary" value={state.emprestimos} onChange={e => update('emprestimos', Number(e.target.value.replace(/\D/g, '') / 100))} />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-500">Plano de Saúde</label>
                  <div className="w-32">
                    <input type="text" className="w-full rounded border-slate-200 text-xs text-right focus:ring-secondary focus:border-secondary" value={state.planoSaude} onChange={e => update('planoSaude', Number(e.target.value.replace(/\D/g, '') / 100))} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-500">Pensão Alimentícia</label>
                  <div className="w-32">
                    <input type="text" className="w-full rounded border-slate-200 text-xs text-right focus:ring-secondary focus:border-secondary" value={state.pensao} onChange={e => update('pensao', Number(e.target.value.replace(/\D/g, '') / 100))} />
                  </div>
                </div>
              </div>
            </div>


            {/* Section 5: 13º Salário (Normalized) */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-left">Décimo Terceiro (Novembro)</h4>
              <label className="flex items-center gap-2 text-xs text-slate-600 mb-1 cursor-pointer">
                <input type="checkbox" checked={state.manualDecimoTerceiroNov} onChange={e => update('manualDecimoTerceiroNov', e.target.checked)} className="rounded border-slate-300 text-slate-600 focus:ring-secondary" />
                Editar Primeira Parcela do 13º?
              </label>
              {!state.manualDecimoTerceiroNov && <p className="text-[10px] text-slate-400 italic ml-6">* Automático (50%)</p>}
              {state.manualDecimoTerceiroNov && (
                <div className="grid grid-cols-2 gap-2 mt-2 ml-6">
                  <input type="number" placeholder="Venc" className="rounded border-slate-200 text-xs py-1 focus:ring-secondary focus:border-secondary" value={state.decimoTerceiroNovVenc} onChange={e => update('decimoTerceiroNovVenc', Number(e.target.value))} />
                  <input type="number" placeholder="FC" className="rounded border-slate-200 text-xs py-1 focus:ring-secondary focus:border-secondary" value={state.decimoTerceiroNovFC} onChange={e => update('decimoTerceiroNovFC', Number(e.target.value))} />
                </div>
              )}
            </div>

            {/* Rubricas Adicionais (Bottom) */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={addRubrica}
                className="w-full py-3 bg-secondary text-white rounded-xl text-xs font-bold uppercase hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Adicionar Rubrica (Manual)
              </button>

              <div className="space-y-2 mt-3">
                {state.rubricasExtras.filter(r => r.tipo === 'D').map((rubrica) => (
                  <div key={rubrica.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <input
                      type="text"
                      placeholder="Descrição"
                      className="flex-1 rounded-md border-slate-200 text-xs py-1.5 focus:ring-secondary focus:border-secondary bg-white"
                      value={rubrica.descricao}
                      onChange={e => updateRubrica(rubrica.id, 'descricao', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Valor"
                      className="w-24 rounded-md border-slate-200 text-xs py-1.5 text-right focus:ring-secondary focus:border-secondary bg-white"
                      value={rubrica.valor || ''}
                      onChange={e => updateRubrica(rubrica.id, 'valor', Number(e.target.value))}
                    />
                    <button onClick={() => removeRubrica(rubrica.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Observações Section (Restored) */}
      <section className="mt-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 card-shadow">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Observações / Notas
        </h3>
        <textarea
          className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm h-24 placeholder-slate-400 focus:border-secondary focus:ring-secondary resize-none p-4"
          placeholder="Digite aqui anotações sobre este cálculo para sair na impressão..."
          value={state.observacoes}
          onChange={e => update('observacoes', e.target.value)}
        />
      </section>

      {/* Results Deck */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden mb-20">
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">receipt_long</span> Detalhamento
          </h3>
          <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-mono">Ref: {state.mesRef}/{state.anoRef}</span>
        </div>

        <div className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase text-xs">Rubrica</th>
                <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase text-xs">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resultRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className={`px-6 py-3 font-medium ${row.type === 'C' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {row.label}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-700">{formatCurrency(row.value)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800 uppercase">Total Bruto</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(state.totalBruto)}</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-rose-600 uppercase">Total Descontos</td>
                <td className="px-6 py-4 text-right font-bold text-rose-600">{formatCurrency(state.totalDescontos)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 py-4 px-6 z-50 card-shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resultado Líquido</p>
            <p className="text-sm text-slate-500">Considerando todos os descontos legais e opcionais.</p>
          </div>
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={handleExportPDF}
                className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 font-bold text-xs"
                title="Exportar PDF/Holerite"
              >
                <FileText size={18} /> <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 font-bold text-xs"
                title="Exportar Excel"
              >
                <Table size={18} /> <span className="hidden sm:inline">Excel</span>
              </button>
            </div>

            <div className="text-right">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1 md:hidden">Líquido</span>
              <span className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight brand-gradient-text">
                {formatCurrency(state.liquido)}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div >
  );
}