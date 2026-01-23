/**
 * Cálculos de Licença Compensatória - JMU
 * 
 * Responsável por calcular:
 * - Licença compensatória proporcional aos dias
 * - Abono sobre licença (opcional)
 * 
 * Baseado em LEGACY_FORMULAS.md seção 9 (L314-337)
 */

import { HISTORICO_PSS } from '../../../../../data';
import { calculatePss } from '../../../../../core/calculations/taxUtils';
import { IJmuCalculationParams } from '../types';
import { getDataForPeriod } from './baseCalculations';

/**
 * Calcula Licença Compensatória
 */
export function calculateCompensatoryLeave(params: IJmuCalculationParams): number {
    const { salario, funcoes, valorVR } = getDataForPeriod(params.periodo);
    const baseVencimento = salario[params.cargo]?.[params.padrao] || 0;
    const gaj = baseVencimento * 1.40;

    let aqTituloVal = 0;
    let aqTreinoVal = 0;
    if (params.periodo >= 1) {
        aqTituloVal = valorVR * params.aqTituloVR;
        aqTreinoVal = valorVR * params.aqTreinoVR;
    } else {
        aqTituloVal = baseVencimento * params.aqTituloPerc;
        aqTreinoVal = baseVencimento * params.aqTreinoPerc;
    }

    let gratVal = 0;
    if (params.gratEspecificaTipo === 'gae' || params.gratEspecificaTipo === 'gas') {
        gratVal = baseVencimento * 0.35;
    }

    // Função usada na licença
    let valFuncaoLicenca = 0;
    if (params.baseLicenca === 'auto') {
        valFuncaoLicenca = params.funcao === '0' ? 0 : (funcoes[params.funcao] || 0);
    } else if (funcoes[params.baseLicenca]) {
        valFuncaoLicenca = funcoes[params.baseLicenca];
    }

    // Base da Licença
    const baseLicencaTotal = baseVencimento + gaj + aqTituloVal + aqTreinoVal +
        gratVal + (params.vpni_lei || 0) +
        (params.vpni_decisao || 0) + (params.ats || 0) +
        valFuncaoLicenca;

    // Abono sobre licença (opcional)
    let abonoEstimadoLicenca = 0;
    if (params.incluirAbonoLicenca) {
        const pssTable = HISTORICO_PSS[params.tabelaPSS];
        abonoEstimadoLicenca = calculatePss(baseLicencaTotal, pssTable);
    }

    // Valor da Licença = (Base + Abono) / 30 * Dias
    const licencaVal = ((baseLicencaTotal + abonoEstimadoLicenca) / 30) * (params.licencaDias || 0);

    return Math.round(licencaVal * 100) / 100;
}
