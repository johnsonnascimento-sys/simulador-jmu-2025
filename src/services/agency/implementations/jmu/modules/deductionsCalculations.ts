/**
 * Cálculos de Deduções - JMU
 * 
 * Responsável por calcular:
 * - PSS (Previdência Social do Servidor)
 * - IRRF (Imposto de Renda Retido na Fonte)
 * - Funpresp (Fundação de Previdência Complementar)
 * 
 * Baseado nas regras de tributação do PJU
 */

import { DEDUCAO_DEP, HISTORICO_IR, HISTORICO_PSS } from '../../../../../data';
import { calculatePss, calculateIrrf } from '../../../../../core/calculations/taxUtils';
import { IJmuCalculationParams } from '../types';
import { getDataForPeriod } from './baseCalculations';

export interface DeductionsResult {
    pss: number;
    funpresp: number;
    irrf: number;
    total: number;
}

/**
 * Calcula Deduções (PSS, IRRF, Funpresp)
 */
export function calculateDeductions(grossValue: number, params: IJmuCalculationParams): DeductionsResult {
    const { salario, funcoes, valorVR } = getDataForPeriod(params.periodo);
    const baseVencimento = salario[params.cargo]?.[params.padrao] || 0;
    const gaj = baseVencimento * 1.40;

    // Recalculate components needed for PSS Base
    let aqTituloVal = 0;
    if (params.periodo >= 1) aqTituloVal = valorVR * params.aqTituloVR;
    else aqTituloVal = baseVencimento * params.aqTituloPerc;

    const funcaoValor = params.funcao === '0' ? 0 : (funcoes[params.funcao] || 0);

    let gratVal = 0;
    if (params.gratEspecificaTipo === 'gae' || params.gratEspecificaTipo === 'gas') {
        gratVal = baseVencimento * 0.35;
    }

    // PSS Base Calculation
    let basePSS = baseVencimento + gaj + aqTituloVal + (params.vpni_lei || 0) + (params.vpni_decisao || 0) + (params.ats || 0);
    if (params.incidirPSSGrat) basePSS += gratVal;
    if (params.pssSobreFC) basePSS += funcaoValor;

    const pssTable = HISTORICO_PSS[params.tabelaPSS];
    const teto = pssTable.teto_rgps;
    const usaTeto = params.regimePrev === 'migrado' || params.regimePrev === 'rpc';

    let pssMensal = 0;
    let baseFunpresp = 0;

    if (usaTeto) {
        const baseLimitada = Math.min(basePSS, teto);
        pssMensal = calculatePss(baseLimitada, pssTable);
        baseFunpresp = Math.max(0, basePSS - teto);
    } else {
        pssMensal = calculatePss(basePSS, pssTable);
    }

    // Funpresp
    let valFunpresp = 0;
    if (usaTeto && baseFunpresp > 0) {
        valFunpresp = baseFunpresp * params.funprespAliq + (baseFunpresp * (params.funprespFacul / 100));
    }

    // IRRF Base
    const abonoPerm = params.recebeAbono ? pssMensal : 0;

    // Recalculate full taxable partials
    let aqTreinoVal = 0;
    if (params.periodo >= 1) aqTreinoVal = valorVR * params.aqTreinoVR;
    else aqTreinoVal = baseVencimento * params.aqTreinoPerc;

    // Total Tributavel Construction
    let totalTrib = baseVencimento + gaj + aqTituloVal + aqTreinoVal + funcaoValor + gratVal +
        (params.vpni_lei || 0) + (params.vpni_decisao || 0) + (params.ats || 0) + abonoPerm;

    const baseIR = totalTrib - pssMensal - valFunpresp - (params.dependents * DEDUCAO_DEP);

    const deductionVal = HISTORICO_IR[params.tabelaIR] || 896.00;
    const irMensal = calculateIrrf(baseIR, 0.275, deductionVal);

    return {
        pss: pssMensal,
        funpresp: valFunpresp,
        irrf: irMensal,
        total: pssMensal + valFunpresp + irMensal
    };
}
