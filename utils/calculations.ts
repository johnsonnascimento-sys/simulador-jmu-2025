import { BASES_2025, HISTORICO_PSS, HISTORICO_IR, DEDUCAO_DEP, COTA_PRE_ESCOLAR, CJ1_INTEGRAL_BASE } from '../data';
import { CalculatorState, SalaryTable, FuncoesTable } from '../types';

export const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Reajuste based on Lei 11.416 steps
export const calcReajuste = (valorBase: number, steps: number) => {
    let val = valorBase;
    for (let i = 0; i < steps; i++) {
        val = Math.floor(val * 1.08 * 100) / 100;
    }
    return val;
};

// Helper for rounding to 2 decimals (fixes precision issues vs Original JS)
const round2 = (val: number) => Math.round(val * 100) / 100;

export const getTablesForPeriod = (periodo: number) => {
    const steps = periodo >= 2 ? periodo - 1 : 0;

    const newSal: SalaryTable = { analista: {}, tec: {} };
    for (let cargo in BASES_2025.salario) {
        for (let padrao in BASES_2025.salario[cargo as 'analista' | 'tec']) {
            newSal[cargo][padrao] = calcReajuste(BASES_2025.salario[cargo as 'analista' | 'tec'][padrao], steps);
        }
    }

    const newFunc: FuncoesTable = {};
    for (let key in BASES_2025.funcoes) {
        newFunc[key] = calcReajuste(BASES_2025.funcoes[key], steps);
    }

    // Dynamic VR Calculation
    const cj1Adjusted = calcReajuste(CJ1_INTEGRAL_BASE, steps);
    const valorVR = Math.round(cj1Adjusted * 0.065 * 100) / 100;

    return { salario: newSal, funcoes: newFunc, valorVR };
};

export const calcPSS = (base: number, tabelaKey: string) => {
    let total = 0;
    const table = HISTORICO_PSS[tabelaKey];
    if (!table) return 0;

    for (let f of table.faixas) {
        if (base > f.min) {
            let teto = Math.min(base, f.max);
            if (teto > f.min) total += (teto - f.min) * f.rate;
        }
    }
    return total;
};

export const calcIR = (base: number, deductionKey: string) => {
    const deduction = HISTORICO_IR[deductionKey] || 896.00;
    let val = (base * 0.275) - deduction;
    return val > 0 ? val : 0;
};

// Lógica de IR Progressivo conforme código original (Holerite 8249)
export const calcIR_Progressivo = (baseCalculo: number) => {
    if (baseCalculo <= 2259.20) {
        return 0.00;
    } else if (baseCalculo <= 2826.65) {
        return (baseCalculo * 0.075) - 169.44;
    } else if (baseCalculo <= 3751.05) {
        return (baseCalculo * 0.150) - 381.44;
    } else if (baseCalculo <= 4664.68) {
        return (baseCalculo * 0.225) - 662.77;
    } else {
        return (baseCalculo * 0.275) - 896.00;
    }
};

// Helper to calculate the Fixed Base (Remuneração Fixa)
export const calculateBaseFixa = (state: CalculatorState, funcoes: FuncoesTable, salario: SalaryTable, valorVR: number): { baseSemFC: number; totalComFC: number; funcaoValor: number } => {
    const baseVencimento = salario[state.cargo][state.padrao] || 0;
    const gaj = baseVencimento * 1.40;
    const funcaoValor = state.funcao === '0' ? 0 : (funcoes[state.funcao] || 0);

    let aqTituloVal = 0;
    let aqTreinoVal = 0;
    if (state.periodo >= 1) {
        aqTituloVal = valorVR * state.aqTituloVR;
        aqTreinoVal = valorVR * state.aqTreinoVR;
    } else {
        aqTituloVal = baseVencimento * state.aqTituloPerc;
        aqTreinoVal = baseVencimento * state.aqTreinoPerc;
    }

    let gratVal = state.gratEspecificaValor;
    if (state.gratEspecificaTipo === 'gae' || state.gratEspecificaTipo === 'gas') {
        gratVal = baseVencimento * 0.35;
    } else {
        gratVal = 0;
    }

    const baseSemFC = baseVencimento + gaj + aqTituloVal + aqTreinoVal + gratVal + state.vpni_lei + state.vpni_decisao + state.ats;
    const totalComFC = baseSemFC + funcaoValor;

    return { baseSemFC, totalComFC, funcaoValor };
};

export const calculateAll = (state: CalculatorState): CalculatorState => {
    const { salario, funcoes, valorVR } = getTablesForPeriod(state.periodo);

    // 1. Basic Income
    const baseVencimento = salario[state.cargo][state.padrao] || 0;
    const gaj = baseVencimento * 1.40;
    const funcaoValor = state.funcao === '0' ? 0 : (funcoes[state.funcao] || 0);

    // 2. AQ
    let aqTituloVal = 0;
    let aqTreinoVal = 0;
    if (state.periodo >= 1) {
        aqTituloVal = valorVR * state.aqTituloVR;
    } else {
        aqTituloVal = round2(baseVencimento * state.aqTituloPerc);
        aqTreinoVal = round2(baseVencimento * state.aqTreinoPerc);
    }

    // 3. Grat Specific
    let gratVal = state.gratEspecificaValor;

    // Normalize type
    const gratType = (state.gratEspecificaTipo || '').toLowerCase().trim();

    if (gratType === 'gae' || gratType === 'gas') {
        gratVal = round2(baseVencimento * 0.35);
    } else {
        // Force reset if type is '0' or invalid
        gratVal = 0;
    }

    // 4. Variables
    const preEscolarVal = state.auxPreEscolarQtd * COTA_PRE_ESCOLAR;

    // HE Calculation - Base Update Logic
    let baseHE = 0;
    if (state.manualBaseHE) {
        // Se marcado "Não atualizar", mantém o valor digitado/anterior
        baseHE = state.heBase;
    } else {
        // Se automático, soma todos os rendimentos tributáveis
        baseHE = baseVencimento + gaj + aqTituloVal + aqTreinoVal + funcaoValor + gratVal + state.vpni_lei + state.vpni_decisao + state.ats;

        // Add Abono Estimado if checked (pois integra a base de cálculo)
        if (state.recebeAbono) {
            let baseForPSS = baseHE;
            if (!state.pssSobreAQTreino) baseForPSS -= aqTreinoVal;
            if (!state.pssSobreFC) baseForPSS -= funcaoValor;
            if (!state.incidirPSSGrat) baseForPSS -= gratVal;

            const teto = HISTORICO_PSS[state.tabelaPSS].teto_rgps;
            const usaTeto = state.regimePrev === 'migrado' || state.regimePrev === 'rpc';

            if (usaTeto) {
                baseForPSS = Math.min(baseForPSS, teto);
            }
            const abonoEstimado = calcPSS(baseForPSS, state.tabelaPSS);
            baseHE += abonoEstimado;
        }
    }

    const valorHora = baseHE / 175;
    const heVal50 = (valorHora * 1.5 * state.heQtd50);
    const heVal100 = (valorHora * 2.0 * state.heQtd100);
    const heTotal = heVal50 + heVal100;

    // Substitution Calculation
    let substTotalCalc = 0;
    const baseAbatimento = funcaoValor + gratVal;

    for (const [funcKey, days] of Object.entries(state.substDias)) {
        if (days > 0 && funcoes[funcKey]) {
            const valDestino = funcoes[funcKey];
            if (valDestino > baseAbatimento) {
                substTotalCalc += ((valDestino - baseAbatimento) / 30) * days;
            }
        }
    }

    // License
    let valFuncaoLicenca = 0;
    if (state.baseLicenca === 'auto') valFuncaoLicenca = funcaoValor;
    else if (funcoes[state.baseLicenca]) valFuncaoLicenca = funcoes[state.baseLicenca];

    const baseLicencaTotal = baseVencimento + gaj + aqTituloVal + aqTreinoVal + gratVal + state.vpni_lei + state.vpni_decisao + state.ats + valFuncaoLicenca;

    let abonoEstimadoLicenca = 0;
    if (state.incluirAbonoLicenca) {
        abonoEstimadoLicenca = calcPSS(baseLicencaTotal, state.tabelaPSS);
    }

    const licencaVal = ((baseLicencaTotal + abonoEstimadoLicenca) / 30) * Math.min(state.licencaDias, 4);

    // 5. Total Base for PSS
    let basePSS = baseVencimento + gaj + aqTituloVal + state.vpni_lei + state.vpni_decisao + state.ats;

    if (state.incidirPSSGrat) {
        basePSS += gratVal;
    }

    if (state.pssSobreFC) basePSS += funcaoValor;
    if (state.pssSobreAQTreino) basePSS += aqTreinoVal;

    // HE e Subst entram na base PSS se NÃO forem EA (Indenizatórias/EA não incidem PSS normalmente no simulador padrão, mas aqui segue regra do usuário)
    // Nota: Geralmente HE incide PSS. Se for EA, pode não incidir. 
    // No código original (JS): "SE NÃO FOR EA, ENTRA NA BASE PSS."
    if (!state.heIsEA) basePSS += heTotal;
    if (!state.substIsEA) basePSS += substTotalCalc;

    // Teto Logic
    const teto = HISTORICO_PSS[state.tabelaPSS].teto_rgps;
    const usaTeto = state.regimePrev === 'migrado' || state.regimePrev === 'rpc';

    let pssMensal = 0;
    let baseFunpresp = 0;

    if (usaTeto) {
        const baseLimitada = Math.min(basePSS, teto);
        pssMensal = calcPSS(baseLimitada, state.tabelaPSS);
        baseFunpresp = Math.max(0, basePSS - teto);
    } else {
        pssMensal = calcPSS(basePSS, state.tabelaPSS);
    }

    // Funpresp
    let valFunpresp = 0;
    if (usaTeto && baseFunpresp > 0) {
        valFunpresp = baseFunpresp * state.funprespAliq + (baseFunpresp * (state.funprespFacul / 100));
    }

    // Abono
    const abonoPerm = state.recebeAbono ? pssMensal : 0;

    // IR Base - EC (Exercício Corrente)
    let totalTribMensal = baseVencimento + gaj + aqTituloVal + aqTreinoVal + funcaoValor + gratVal + state.vpni_lei + state.vpni_decisao + state.ats + abonoPerm;

    // Só adiciona ao IR Mensal se NÃO for EA
    if (!state.substIsEA) totalTribMensal += substTotalCalc;
    if (!state.heIsEA) totalTribMensal += heTotal;

    const baseIR = totalTribMensal - pssMensal - valFunpresp - (state.dependentes * DEDUCAO_DEP);
    const irMensal = calcIR(baseIR, state.tabelaIR);

    // IR EA (Exercício Anterior / RRA) - Calculado Separadamente
    let irEA = 0;
    let baseEA = 0;
    if (state.heIsEA) baseEA += heTotal;
    if (state.substIsEA) baseEA += substTotalCalc;

    if (baseEA > 0) {
        // Deduz dependentes também na base EA se aplicável (lógica padrão RRA permite)
        // Usa a função progressiva específica fornecida
        irEA = calcIR_Progressivo(baseEA - (state.dependentes * DEDUCAO_DEP));
        if (irEA < 0) irEA = 0;
    }

    // IR Ferias (Separado)
    let irFerias = 0;
    if (state.ferias1_3 > 0 && !state.feriasAntecipadas) {
        const baseIRFerias = state.ferias1_3 - (state.dependentes * DEDUCAO_DEP);
        irFerias = calcIR(baseIRFerias, state.tabelaIR);
    }

    // Transport
    let auxTranspCred = 0;
    let auxTranspDeb = 0;
    if (state.auxTransporteGasto > 0) {
        auxTranspCred = state.auxTransporteGasto;
        const baseCalculoDesc = baseVencimento > 0 ? baseVencimento : funcaoValor;
        const desc = (baseCalculoDesc / 30 * 22) * 0.06;

        if (desc >= auxTranspCred) {
            auxTranspCred = 0;
        } else {
            auxTranspDeb = desc;
        }
    }

    // 13th Total & Vacation (Manual Check)
    let adiant13Venc = state.adiant13Venc;
    let adiant13FC = state.adiant13FC;
    let ferias1_3 = state.ferias1_3;

    if (!state.manualAdiant13 && state.tipoCalculo !== 'jan' && state.tipoCalculo !== 'jun') {
        adiant13Venc = 0;
        adiant13FC = 0;
    }

    if (!state.manualFerias) {
        // Logic for automatic Vacation calculation could go here, but usually it's triggered manually
    }

    const adiant13Total = adiant13Venc + adiant13FC;

    // Rubricas Extras Logic
    let totalRubricasCred = 0;
    let totalRubricasDeb = 0;
    state.rubricasExtras.forEach(r => {
        if (r.tipo === 'C') totalRubricasCred += r.valor;
        else totalRubricasDeb += r.valor;
    });

    // Totals
    const totalBruto = baseVencimento + gaj + aqTituloVal + aqTreinoVal + funcaoValor + gratVal +
        state.vpni_lei + state.vpni_decisao + state.ats + abonoPerm +
        heTotal + substTotalCalc + licencaVal +
        state.auxAlimentacao + preEscolarVal + auxTranspCred + ferias1_3 + adiant13Total + totalRubricasCred;

    const totalDescontos = pssMensal + valFunpresp + irMensal + irEA + irFerias +
        state.emprestimos + state.planoSaude + state.pensao + auxTranspDeb + totalRubricasDeb;

    return {
        ...state,
        vencimento: baseVencimento,
        gaj,
        aqTituloValor: aqTituloVal,
        aqTreinoValor: aqTreinoVal,
        gratEspecificaValor: gratVal,
        heVal50,
        heVal100,
        heTotal,
        heBase: baseHE,
        substTotal: substTotalCalc,
        auxPreEscolarValor: preEscolarVal,
        abonoPermanencia: abonoPerm,
        pssMensal,
        valFunpresp,
        irMensal,
        irEA,
        irFerias,
        auxTransporteValor: auxTranspCred,
        auxTransporteDesc: auxTranspDeb,
        licencaValor: licencaVal,
        totalBruto,
        totalDescontos,
        liquido: totalBruto - totalDescontos,
        ferias1_3: state.manualFerias ? state.ferias1_3 : ferias1_3,
        adiant13Venc: state.manualAdiant13 ? state.adiant13Venc : adiant13Venc,
        adiant13FC: state.manualAdiant13 ? state.adiant13FC : adiant13FC,
    };
};
