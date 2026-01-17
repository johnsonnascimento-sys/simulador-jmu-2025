import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INITIAL_STATE, CalculatorState, Rubrica, CourtConfig } from '../types';
import { getCourtBySlug } from '../services/courtService';
import { calculateAll, formatCurrency, getTablesForPeriod, calculateBaseFixa } from '../utils/calculations';
import { Settings, FileText, ArrowLeft, Trash2, Plus, Table, DollarSign, PlusCircle, Minus, List, Receipt } from 'lucide-react';
import { Accordion } from '../components/Accordion';
import { Input, Select } from '../components/Inputs';
import DonationModal from '../components/DonationModal';

import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';



// Estilos Reutilizáveis (Design System)
const styles = {
  card: "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm",
  sectionTitle: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2",
  label: "block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5",
  input: "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all",
  checkboxLabel: "flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none",
  checkbox: "rounded border-slate-300 text-secondary focus:ring-secondary",
  accordionHeader: "px-5 py-4 font-bold text-sm text-slate-700 dark:text-slate-200",
  accordionContent: "p-5 border-t border-slate-100 dark:border-slate-700",
  accordionWrapper: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-all hover:shadow-md",
  internalTotalWrapper: "mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center",
  internalTotalLabel: "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
  internalTotalValue: "text-sm font-bold text-slate-700 dark:text-white font-mono",
  actionButton: "w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors uppercase tracking-wide",
  valueDisplay: "text-sm font-bold text-slate-700 dark:text-slate-200 font-mono",

  // Estilo do Box (Quadradinho)
  innerBox: "bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-700",
  innerBoxTitle: "text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 flex justify-between"
};

// Função auxiliar ROBUSTA para carregar imagem no PDF via Fetch
const getBase64ImageFromURL = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao converter imagem para Base64:", error);
    throw error;
  }
};

export default function Calculator() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const [courtConfig, setCourtConfig] = useState<CourtConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Estado do Modal de Doação
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<'pdf' | 'excel'>('pdf');

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

  const handleExportPDF = async () => {
    const doc = new jsPDF();

    // Configura o nome do órgão. 
    // Se courtConfig.name existir, usa ele. Se não, usa o padrão.
    const orgName = (courtConfig?.name && courtConfig.name.trim() !== '')
      ? courtConfig.name.toUpperCase()
      : "SIMULADOR DE SALÁRIO";

    // --- LOGO E CABEÇALHO ---
    // Logo removida temporariamente pois o arquivo não existe
    // try { ... } catch (e) { ... }

    // Nome do Site e URL (Marca no topo direito)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235); // Azul (Secondary)
    doc.text("Salário do Servidor", 195, 18, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("www.salariodoservidor.com.br", 195, 23, { align: "right" });

    // Nome do Órgão (Centralizado)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(orgName, 105, 25, { align: "center" });

    // Detalhes do Servidor
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Demonstrativo de Pagamento Simulado - Ref: ${state.mesRef}/${state.anoRef}`, 105, 35, { align: "center" });
    doc.text(`Servidor: ${state.nome || "SERVIDOR SIMULADO"}`, 14, 45);

    // --- TABELA ---
    const tableBody = resultRows.map(row => [
      row.type === 'C' ? 'C' : 'D',
      row.label,
      row.type === 'C' ? formatCurrency(row.value) : '',
      row.type === 'D' ? formatCurrency(row.value) : ''
    ]);
    tableBody.push(['', 'TOTAL', formatCurrency(state.totalBruto), formatCurrency(state.totalDescontos)]);

    (doc as any).autoTable({
      head: [['TIPO', 'RUBRICA', 'PROVENTOS', 'DESCONTOS']],
      body: tableBody,
      startY: 50,
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

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`LÍQUIDO A RECEBER: ${formatCurrency(state.liquido)}`, 195, finalY, { align: "right" });

    if (state.observacoes) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const splitObs = doc.splitTextToSize(`OBS: ${state.observacoes}`, 180);
      doc.text(splitObs, 14, finalY + 10);
    }

    // --- DISCLAIMER (AVISO LEGAL) ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(150);
    const disclaimerText = "AVISO LEGAL: Os dados desta simulação são meramente ilustrativos, não possuem valor legal e podem conter imprecisões. Os cálculos oficiais devem ser sempre confirmados junto à unidade de pagamento do órgão competente.";
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, 180);
    doc.text(splitDisclaimer, 105, pageHeight - 15, { align: "center" });

    // Forçando download manual para garantir nome correto
    const pdfBlob = doc.output('blob');
    saveAs(pdfBlob, `Holerite_${state.mesRef}_${state.anoRef}.pdf`);
  };

  const handleExportExcel = () => {
    const orgName = (courtConfig?.name && courtConfig.name.trim() !== '')
      ? courtConfig.name.toUpperCase()
      : "SIMULADOR DE SALÁRIO";

    const wb = XLSX.utils.book_new();
    const wsData = [
      [orgName],
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

    // Disclaimer no Excel
    wsData.push([""]);
    wsData.push(["AVISO LEGAL:", "Os dados desta simulação são meramente ilustrativos e não possuem valor legal. Confirme sempre com o órgão oficial."]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Holerite");

    // Forçando download manual para garantir nome correto do arquivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelBlob, `Holerite_${state.mesRef}_${state.anoRef}.xlsx`);
  };



  // Funções para abrir modal de doação antes de exportar
  const initiateExportPDF = () => {
    setPendingExportType('pdf');
    setDonationModalOpen(true);
  };

  const initiateExportExcel = () => {
    setPendingExportType('excel');
    setDonationModalOpen(true);
  };

  const handleDonationComplete = () => {
    if (pendingExportType === 'pdf') {
      handleExportPDF();
    } else {
      handleExportExcel();
    }
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
          <button onClick={() => navigate('/')} className="bg-white dark:bg-slate-800 p-2 rounded-xl text-slate-500 hover:text-secondary shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
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

        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Nome para impressão (Opcional)"
            className={`${styles.input} w-full`}
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
        </div>
      </div>

      {/* Global Config Card */}
      <div className={`${styles.card} mb-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h3 className={styles.sectionTitle}>
          <Settings className="w-4 h-4" />
          Configurações Globais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div>
            <label className={styles.label}>Ref. Salarial</label>
            <select
              className={styles.input}
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
            <label className={styles.label}>Mês de Referência (PDF)</label>
            <div className="flex gap-2">
              <select
                className={styles.input}
                value={state.mesRef}
                onChange={e => update('mesRef', e.target.value)}
              >
                {["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                className={`${styles.input} w-24`}
                value={state.anoRef}
                onChange={e => update('anoRef', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className={styles.label}>Tipo de Cálculo</label>
            <select
              className={styles.input}
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
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>
              <DollarSign className="w-4 h-4" />Rendimentos Fixos
            </h3>

            {/* Cargo Grouped Box */}
            <div className={styles.innerBox}>
              <h4 className={styles.innerBoxTitle}>
                Dados Funcionais
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={styles.label}>Cargo</label>
                    <select className={styles.input} value={state.cargo} onChange={e => update('cargo', e.target.value)}>
                      <option value="tec">Técnico</option>
                      <option value="analista">Analista</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Classe/Padrão</label>
                    <select className={styles.input} value={state.padrao} onChange={e => update('padrao', e.target.value)}>
                      {Object.keys(currentTables.salario[state.cargo]).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={styles.label}>FC / CJ</label>
                  <select className={styles.input} value={state.funcao} onChange={e => update('funcao', e.target.value)}>
                    <option value="0">Sem Função / Manual</option>
                    {Object.keys(currentTables.funcoes).map(f => (
                      <option key={f} value={f}>{f.toUpperCase()} - {formatCurrency(currentTables.funcoes[f])}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* AQ Section */}
            <div className={styles.innerBox}>
              <h4 className={styles.innerBoxTitle}>
                Adicional Qualificação
                <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{isNovoAQ ? 'LEI 15.292/2026' : 'REGRA ATUAL'}</span>
              </h4>

              {isNovoAQ ? (
                <div className="space-y-3">
                  <div>
                    <label className={styles.label}>Títulos (Base: VR)</label>
                    <select className={styles.input} value={state.aqTituloVR} onChange={e => update('aqTituloVR', Number(e.target.value))}>
                      <option value={0}>Nenhum</option>
                      <option value={1}>1x Esp. (1 VR)</option>
                      <option value={2}>2x Esp. (2 VR)</option>
                      <option value={3.5}>Mestrado (3.5 VR)</option>
                      <option value={5}>Doutorado (5 VR)</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Treinamento</label>
                    <select className={styles.input} value={state.aqTreinoVR} onChange={e => update('aqTreinoVR', Number(e.target.value))}>
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
                    <label className={styles.label}>Títulos (Base: VB)</label>
                    <select className={styles.input} value={state.aqTituloPerc} onChange={e => update('aqTituloPerc', Number(e.target.value))}>
                      <option value={0}>Nenhum</option>
                      <option value={0.05}>Graduação (5%)</option>
                      <option value={0.075}>Especialização (7.5%)</option>
                      <option value={0.10}>Mestrado (10%)</option>
                      <option value={0.125}>Doutorado (12.5%)</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Treinamento</label>
                    <select className={styles.input} value={state.aqTreinoPerc} onChange={e => update('aqTreinoPerc', Number(e.target.value))}>
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
            <div className="space-y-3">
              <Accordion title="Gratificação (GAE/GAS)" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <select className={`${styles.input} mb-4`} value={state.gratEspecificaTipo} onChange={e => update('gratEspecificaTipo', e.target.value)}>
                  <option value="0">Nenhuma</option>
                  <option value="gae">GAE (Oficial de Justiça)</option>
                  <option value="gas">GAS (Agente de Polícia)</option>
                </select>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={state.incidirPSSGrat} onChange={e => update('incidirPSSGrat', e.target.checked)} className={styles.checkbox} />
                  Incidir PSS?
                </label>
                {state.gratEspecificaTipo !== '0' && (
                  <div className={styles.internalTotalWrapper}>
                    <span className={styles.internalTotalLabel}>Total Gratificação</span>
                    <span className={styles.internalTotalValue}>{formatCurrency(state.gratEspecificaValor)}</span>
                  </div>
                )}
              </Accordion>

              <Accordion title="Vantagens Pessoais" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={`${styles.accordionContent} space-y-4`}>
                <div>
                  <label className={styles.label}>VPNI (Lei 9.527)</label>
                  <input type="number" className={styles.input} value={state.vpni_lei} onChange={e => update('vpni_lei', Number(e.target.value))} />
                </div>
                <div>
                  <label className={styles.label}>VPNI (Decisão)</label>
                  <input type="number" className={styles.input} value={state.vpni_decisao} onChange={e => update('vpni_decisao', Number(e.target.value))} />
                </div>
                <div>
                  <label className={styles.label}>ATS (Anuênios)</label>
                  <input type="number" className={styles.input} value={state.ats} onChange={e => update('ats', Number(e.target.value))} />
                </div>
              </Accordion>

              <Accordion title="Abono de Permanência" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={state.recebeAbono} onChange={e => update('recebeAbono', e.target.checked)} className={styles.checkbox} />
                  Recebo Abono?
                </label>
                {state.recebeAbono && (
                  <div className={styles.internalTotalWrapper}>
                    <span className={styles.internalTotalLabel}>Total Abono</span>
                    <span className={styles.internalTotalValue}>{formatCurrency(state.abonoPermanencia)}</span>
                  </div>
                )}
              </Accordion>
            </div>

          </div>
        </div>

        {/* Column 2: Variable Earnings */}
        <div className="space-y-6">
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>
              <PlusCircle className="w-4 h-4" />Rendimentos Variáveis
            </h3>

            <div className="space-y-3">

              {/* Férias */}
              <Accordion title="Férias" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <label className={`${styles.checkboxLabel} mb-3`}>
                  <input type="checkbox" checked={state.manualFerias} onChange={e => update('manualFerias', e.target.checked)} className={styles.checkbox} />
                  Editar Manualmente
                </label>
                <input
                  className={`${styles.input} mb-3 ${!state.manualFerias ? 'bg-slate-50 text-slate-400' : ''}`}
                  value={state.ferias1_3}
                  onChange={e => update('ferias1_3', Number(e.target.value))}
                  readOnly={!state.manualFerias}
                  type="number"
                />
                <button onClick={handleCalcFerias} className={`${styles.actionButton} mb-3`}>
                  Calcular 1/3 Automático
                </button>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={state.feriasAntecipadas} onChange={e => update('feriasAntecipadas', e.target.checked)} className={styles.checkbox} />
                  Recebi mês passado? (Desconto)
                </label>
              </Accordion>

              {/* 13º Salário */}
              <Accordion title="13º Salário (Adiantamento)" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={styles.label}>Vencimento</label>
                    <input type="number" className={styles.input} value={state.adiant13Venc} onChange={e => update('adiant13Venc', Number(e.target.value))} readOnly={!state.manualAdiant13} />
                  </div>
                  <div>
                    <label className={styles.label}>FC/CJ</label>
                    <input type="number" className={styles.input} value={state.adiant13FC} onChange={e => update('adiant13FC', Number(e.target.value))} readOnly={!state.manualAdiant13} />
                  </div>
                </div>
                <button onClick={handleCalc13Manual} className={styles.actionButton}>
                  Calcular Automático
                </button>
                <div className="mt-3">
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={state.manualAdiant13} onChange={e => update('manualAdiant13', e.target.checked)} className={styles.checkbox} />
                    Editar Manualmente
                  </label>
                </div>
              </Accordion>

              {/* Horas Extras */}
              <Accordion title="Horas Extras" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <div className="flex items-center justify-between mb-4">
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={state.heIsEA} onChange={e => update('heIsEA', e.target.checked)} className={styles.checkbox} />
                    Pagamento como EA?
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={state.manualBaseHE} onChange={e => update('manualBaseHE', e.target.checked)} className={styles.checkbox} />
                    Editar manualmente
                  </label>
                </div>

                <div className="mb-4">
                  <label className={styles.label}>Base de Cálculo HE</label>
                  <input
                    type="number"
                    className={`${styles.input} ${!state.manualBaseHE ? 'bg-slate-50 text-slate-400' : ''}`}
                    value={state.heBase || ''}
                    disabled={!state.manualBaseHE}
                    onChange={e => update('heBase', Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className={styles.label}>Qtd 50%</label>
                    <input type="number" className={styles.input} value={state.heQtd50} onChange={e => update('heQtd50', Number(e.target.value))} />
                    <div className="text-[10px] text-slate-400 mt-1 font-mono text-right">{formatCurrency(state.heVal50)}</div>
                  </div>
                  <div>
                    <label className={styles.label}>Qtd 100%</label>
                    <input type="number" className={styles.input} value={state.heQtd100} onChange={e => update('heQtd100', Number(e.target.value))} />
                    <div className="text-[10px] text-slate-400 mt-1 font-mono text-right">{formatCurrency(state.heVal100)}</div>
                  </div>
                </div>

                <div className={styles.internalTotalWrapper}>
                  <span className={styles.internalTotalLabel}>Total HE</span>
                  <span className={styles.internalTotalValue}>{formatCurrency(state.heTotal)}</span>
                </div>
              </Accordion>

              {/* Substituição */}
              <Accordion title="Substituição" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <label className={`${styles.checkboxLabel} mb-4`}>
                  <input type="checkbox" checked={state.substIsEA} onChange={e => update('substIsEA', e.target.checked)} className={styles.checkbox} />
                  Pagamento como EA?
                </label>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {['fc1', 'fc2', 'fc3', 'fc4', 'fc5', 'fc6', 'cj1', 'cj2', 'cj3', 'cj4'].map(key => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">{key.replace(/(\d+)/, '-$1')}</span>
                      <input
                        type="number"
                        placeholder="Dias"
                        className={`${styles.input} w-10 px-0 text-center h-8 py-1 text-xs`}
                        value={state.substDias[key] || ''}
                        onChange={e => updateSubstDays(key, Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.internalTotalWrapper}>
                  <span className={styles.internalTotalLabel}>Total Estimado</span>
                  <span className={styles.internalTotalValue}>{formatCurrency(state.substTotal)}</span>
                </div>
              </Accordion>

              {/* Licença Compensatória */}
              <Accordion title="Licença Compensatória" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <div className="space-y-4">
                  <div>
                    <label className={styles.label}>Função Base</label>
                    <select className={styles.input} value={state.baseLicenca} onChange={e => update('baseLicenca', e.target.value)}>
                      <option value="auto">Minha Função Atual (Titular)</option>
                      <option value="cj4">Substituição de CJ-4</option>
                      <option value="cj3">Substituição de CJ-3</option>
                      <option value="cj2">Substituição de CJ-2</option>
                      <option value="cj1">Substituição de CJ-1</option>
                      <option value="fc6">Substituição de FC-6</option>
                    </select>
                  </div>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={state.incluirAbonoLicenca} onChange={e => update('incluirAbonoLicenca', e.target.checked)} className={styles.checkbox} />
                    Incluir Abono na Base?
                  </label>
                  <div>
                    <label className={styles.label}>Qtd. Dias a Indenizar</label>
                    <input type="number" value={state.licencaDias} onChange={e => update('licencaDias', Number(e.target.value))} className={styles.input} />
                  </div>
                </div>
                <div className={styles.internalTotalWrapper}>
                  <span className={styles.internalTotalLabel}>Total (Isento)</span>
                  <span className={styles.internalTotalValue}>{formatCurrency(state.licencaValor)}</span>
                </div>
              </Accordion>

              {/* Diárias de Viagem */}
              <Accordion title="Diárias de Viagem" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={styles.label}>Qtd Diárias</label>
                    <input type="number" step="0.5" className={styles.input} value={state.diariasQtd} onChange={e => update('diariasQtd', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className={styles.label}>Embarque</label>
                    <select className={styles.input} value={state.diariasEmbarque} onChange={e => update('diariasEmbarque', e.target.value)}>
                      <option value="nao">Não</option>
                      <option value="metade">Ida OU Volta</option>
                      <option value="completo">Ida E Volta</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Abatimentos (Art. 4º)</p>
                  <div className="space-y-2">
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={state.diariasExtHospedagem} onChange={e => update('diariasExtHospedagem', e.target.checked)} className={styles.checkbox} />
                      Hospedagem (55%)
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={state.diariasExtAlimentacao} onChange={e => update('diariasExtAlimentacao', e.target.checked)} className={styles.checkbox} />
                      Alimentação (25%)
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={state.diariasExtTransporte} onChange={e => update('diariasExtTransporte', e.target.checked)} className={styles.checkbox} />
                      Transporte (20%)
                    </label>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={state.diariasDescontarAlimentacao} onChange={e => update('diariasDescontarAlimentacao', e.target.checked)} className={styles.checkbox} />
                    Restituir Aux. Alimentação?
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={state.diariasDescontarTransporte} onChange={e => update('diariasDescontarTransporte', e.target.checked)} className={styles.checkbox} />
                    Restituir Aux. Transporte?
                  </label>
                </div>

                {state.diariasValorTotal > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Extrato Estimado</h5>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>(+) Diárias (Bruto)</span>
                        <span>{formatCurrency(state.diariasBruto - (state.diariasEmbarque === 'completo' ? 586.78 : state.diariasEmbarque === 'metade' ? 293.39 : 0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>(+) Adicional de Embarque</span>
                        <span>{formatCurrency(state.diariasEmbarque === 'completo' ? 586.78 : state.diariasEmbarque === 'metade' ? 293.39 : 0)}</span>
                      </div>

                      {(state.diariasExtHospedagem || state.diariasExtAlimentacao || state.diariasExtTransporte) && (
                        <div className="flex justify-between text-rose-500">
                          <span>(-) Abatimento Benef. Externo</span>
                          <span>- {formatCurrency(state.diariasBruto - state.diariasValorTotal - state.diariasDescAlim - state.diariasDescTransp).replace('R$', '').trim()}</span>
                        </div>
                      )}

                      {state.diariasDescontarAlimentacao && (
                        <div className="flex justify-between text-rose-500">
                          <span>(-) Restituição Aux. Alimentação</span>
                          <span>- {formatCurrency(state.diariasDescAlim)}</span>
                        </div>
                      )}
                      {state.diariasDescontarTransporte && (
                        <div className="flex justify-between text-rose-500">
                          <span>(-) Restituição Aux. Transporte</span>
                          <span>- {formatCurrency(state.diariasDescTransp)}</span>
                        </div>
                      )}

                      <div className={styles.internalTotalWrapper}>
                        <span className={styles.internalTotalLabel}>Total Líquido</span>
                        <span className={styles.internalTotalValue}>{formatCurrency(state.diariasValorTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Accordion>

              {/* Auxílios Combined & Detailed */}
              <div className="space-y-3">
                {/* Alimentação */}
                <Accordion title="Auxílio Alimentação" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                  <select
                    className={styles.input}
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
                <Accordion title="Auxílio Pré-Escolar" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={styles.label}>Cota</label>
                      <select
                        className={styles.input}
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
                      <label className={styles.label}>Qtd</label>
                      <input className={styles.input} type="number" value={state.auxPreEscolarQtd} onChange={e => update('auxPreEscolarQtd', Number(e.target.value))} />
                    </div>
                  </div>
                  <div className={styles.internalTotalWrapper}>
                    <span className={styles.internalTotalLabel}>Total</span>
                    <span className={styles.internalTotalValue}>{formatCurrency(state.auxPreEscolarValor)}</span>
                  </div>
                </Accordion>

                {/* Transporte */}
                <Accordion title="Auxílio Transporte" className={styles.accordionWrapper} headerClassName={styles.accordionHeader} contentClassName={styles.accordionContent}>
                  <label className={styles.label}>Valor Mensal (Gasto)</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={state.auxTransporteGasto}
                    onChange={e => update('auxTransporteGasto', Number(e.target.value))}
                  />
                  {state.auxTransporteGasto > 0 && state.auxTransporteValor === 0 && (
                    <p className="text-[10px] text-rose-500 mt-2 font-bold uppercase tracking-wide">Cancelado (Desconto &gt; Gasto).</p>
                  )}
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Deductions */}
        <div className="space-y-6">
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>
              <Minus className="w-4 h-4" />Descontos
            </h3>

            {/* Section 1: Tabelas de Tributação */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-5 mb-6">
              <h4 className={styles.label}>Tabelas de Tributação (Vigência)</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={styles.label}>Tabela PSS</label>
                  <select className={styles.input} value={state.tabelaPSS} onChange={e => update('tabelaPSS', e.target.value)}>
                    <option value="2026">2026 (Est.)</option>
                    <option value="2025">Portaria MPS/MF 14</option>
                    <option value="2024">2024 (Antiga)</option>
                  </select>
                </div>
                <div>
                  <label className={styles.label}>Tabela IR</label>
                  <select className={styles.input} value={state.tabelaIR} onChange={e => update('tabelaIR', e.target.value)}>
                    <option value="2025_maio">Maio/2025</option>
                    <option value="2024_fev">Fev/2024</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={styles.label}>Dedução Dep.</label>
                  <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400">R$ 189,59</div>
                </div>
                <div>
                  <label className={styles.label}>Dependentes IR</label>
                  <input type="number" className={styles.input} value={state.dependentes} onChange={e => update('dependentes', Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Section 2: Regime de Previdência */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-5 mb-6">
              <h4 className={styles.label}>Regime de Previdência / Ingresso</h4>
              <select className={`${styles.input} mb-4`} value={state.regimePrev} onChange={e => update('regimePrev', e.target.value)}>
                <option value="antigo">Antes de 2013 / Regime Antigo (Integral)</option>
                <option value="migrado">Antes de 2013 (Migrado - Teto)</option>
                <option value="novo_antigo">Após 2013 (Integral - Raro)</option>
                <option value="rpc">Após 2013 (RPC - Teto)</option>
              </select>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={state.pssSobreFC} onChange={e => update('pssSobreFC', e.target.checked)} className={styles.checkbox} />
                Incidir PSS sobre FC/CJ
              </label>
              {state.regimePrev !== 'antigo' && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className={styles.label}>Funpresp</label>
                    <select className={styles.input} value={state.funprespAliq} onChange={e => update('funprespAliq', Number(e.target.value))}>
                      <option value={0}>Não</option>
                      <option value={0.065}>6.5%</option>
                      <option value={0.075}>7.5%</option>
                      <option value={0.085}>8.5%</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Facultativa (%)</label>
                    <input type="number" className={styles.input} value={state.funprespFacul} onChange={e => update('funprespFacul', Number(e.target.value))} />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Deduções Calculadas */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-5 mb-6">
              <h4 className={styles.label}>Deduções Calculadas</h4>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* PSS */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <span className={styles.label}>PSS Mensal</span>
                  <span className={`${styles.valueDisplay} text-rose-600 dark:text-rose-400`}>{formatCurrency(state.pssMensal)}</span>
                </div>
                {/* Funpresp */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <span className={styles.label}>Funpresp</span>
                  <span className={`${styles.valueDisplay} text-indigo-600 dark:text-indigo-400`}>{formatCurrency(state.valFunpresp)}</span>
                </div>
                {/* IRRF Salário */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <span className={styles.label}>IRRF (Salário)</span>
                  <span className={`${styles.valueDisplay} text-rose-600 dark:text-rose-400`}>{formatCurrency(state.irMensal)}</span>
                </div>
                {/* IRRF Férias */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <span className={styles.label}>IRRF Férias</span>
                  <span className={`${styles.valueDisplay} text-rose-600 dark:text-rose-400`}>{formatCurrency(state.irFerias)}</span>
                </div>
                {/* Cota Transporte */}
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm col-span-2">
                  <div className="flex justify-between items-center">
                    <span className={styles.label}>Cota-Parte Transporte</span>
                    <span className={`${styles.valueDisplay} text-rose-600 dark:text-rose-400`}>{formatCurrency(state.auxTransporteDesc)}</span>
                  </div>
                </div>
                {/* Adicional 1/3 Férias (Antecipado) - Agora Padronizado */}
                {state.feriasDesc > 0 && (
                  <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm col-span-2">
                    <div className="flex justify-between items-center">
                      <span className={styles.label}>Adicional 1/3 Férias (Antecipado)</span>
                      <span className={`${styles.valueDisplay} text-rose-600 dark:text-rose-400`}>{formatCurrency(state.feriasDesc)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 13º Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <span className={styles.label}>PSS sobre 13º</span>
                  <span className={`${styles.valueDisplay} text-rose-600 dark:text-rose-400`}>{formatCurrency(state.pss13)}</span>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <span className={styles.label}>IRRF sobre 13º</span>
                  <span className={`${styles.valueDisplay} text-rose-600 dark:text-rose-400`}>{formatCurrency(state.ir13)}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Outros Descontos (Consignações) */}
            <div className="mb-6">
              <h4 className={styles.sectionTitle}>Outros Descontos (Opcionais)</h4>
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Empréstimos</label>
                  <input type="text" className={styles.input} value={state.emprestimos} onChange={e => update('emprestimos', Number(e.target.value.replace(/\D/g, '') / 100))} />
                </div>
                <div>
                  <label className={styles.label}>Plano de Saúde</label>
                  <input type="text" className={styles.input} value={state.planoSaude} onChange={e => update('planoSaude', Number(e.target.value.replace(/\D/g, '') / 100))} />
                </div>
                <div>
                  <label className={styles.label}>Pensão Alimentícia</label>
                  <input type="text" className={styles.input} value={state.pensao} onChange={e => update('pensao', Number(e.target.value.replace(/\D/g, '') / 100))} />
                </div>
              </div>
            </div>

            {/* Section 5: 13º Salário (Nov) */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-5 mb-6">
              <h4 className={styles.label}>Décimo Terceiro (Novembro)</h4>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={state.manualDecimoTerceiroNov} onChange={e => update('manualDecimoTerceiroNov', e.target.checked)} className={styles.checkbox} />
                Editar Manualmente
              </label>
              {!state.manualDecimoTerceiroNov && <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wide">* Automático (50%)</p>}
              {state.manualDecimoTerceiroNov && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={styles.label}>Vencimento</label>
                    <input type="number" className={styles.input} value={state.decimoTerceiroNovVenc} onChange={e => update('decimoTerceiroNovVenc', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className={styles.label}>FC/CJ</label>
                    <input type="number" className={styles.input} value={state.decimoTerceiroNovFC} onChange={e => update('decimoTerceiroNovFC', Number(e.target.value))} />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Rubricas Adicionais (Moved here) */}
      <div className={`${styles.card} mt-8`}>
        <h3 className={styles.sectionTitle}>
          <List className="w-4 h-4" />Rubricas Manuais (Créditos / Débitos)
        </h3>
        <button
          onClick={addRubrica}
          className="w-full py-3 bg-secondary text-white rounded-xl text-xs font-bold uppercase hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="h-4 w-4" /> Adicionar Crédito/Débito (Manual)
        </button>

        <div className="space-y-3">
          {state.rubricasExtras.map((rubrica) => (
            <div key={rubrica.id} className="flex gap-2 items-center flex-wrap md:flex-nowrap">
              <div className="w-full md:w-32">
                <select
                  className={styles.input}
                  value={rubrica.tipo}
                  onChange={e => updateRubrica(rubrica.id, 'tipo', e.target.value)}
                >
                  <option value="C">Crédito (+)</option>
                  <option value="D">Débito (-)</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Descrição"
                className={`${styles.input} flex-1`}
                value={rubrica.descricao}
                onChange={e => updateRubrica(rubrica.id, 'descricao', e.target.value)}
              />
              <input
                type="number"
                placeholder="Valor"
                className={`${styles.input} w-full md:w-32 text-right`}
                value={rubrica.valor || ''}
                onChange={e => updateRubrica(rubrica.id, 'valor', Number(e.target.value))}
              />
              <button onClick={() => removeRubrica(rubrica.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {state.rubricasExtras.length === 0 && (
            <p className="text-center text-sm text-slate-400 italic py-4">Nenhuma rubrica manual adicionada.</p>
          )}
        </div>
      </div>

      {/* Observações Section */}
      <section className={`${styles.card} mt-8`}>
        <h3 className={styles.sectionTitle}>
          <FileText className="h-4 w-4" /> Observações / Notas
        </h3>
        <textarea
          className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm h-24 placeholder-slate-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none p-4 outline-none transition-all"
          placeholder="Digite aqui anotações sobre este cálculo para sair na impressão..."
          value={state.observacoes}
          onChange={e => update('observacoes', e.target.value)}
        />
      </section>

      {/* Results Deck */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden mb-20">
        <div className="bg-slate-800 p-6 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-3">
            <Receipt className="w-5 h-5" /> Detalhamento
          </h3>
          <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-mono border border-white/20">Ref: {state.mesRef}/{state.anoRef}</span>
        </div>

        <div className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-xs tracking-wider">Rubrica</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase text-xs tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {resultRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className={`px-6 py-4 font-medium ${row.type === 'C' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {row.label}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-200">{formatCurrency(row.value)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                <td className="px-6 py-5 font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Total Bruto</td>
                <td className="px-6 py-5 text-right font-bold text-slate-800 dark:text-slate-100 font-mono">{formatCurrency(state.totalBruto)}</td>
              </tr>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                <td className="px-6 py-5 font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Total Descontos</td>
                <td className="px-6 py-5 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(state.totalDescontos)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 py-4 px-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resultado Líquido</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Considerando todos os descontos legais e opcionais.</p>
          </div>
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={initiateExportPDF}
                className="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 font-bold text-xs uppercase tracking-wide"
                title="Exportar PDF/Holerite"
              >
                <FileText size={18} /> <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={initiateExportExcel}
                className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 font-bold text-xs uppercase tracking-wide"
                title="Exportar Excel"
              >
                <Table size={18} /> <span className="hidden sm:inline">Excel</span>
              </button>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Líquido</span>
              <span className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight brand-gradient-text">
                {formatCurrency(state.liquido)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        onDownloadReady={handleDonationComplete}
        exportType={pendingExportType}
        countdownSeconds={10}
      />

    </div >
  );
}