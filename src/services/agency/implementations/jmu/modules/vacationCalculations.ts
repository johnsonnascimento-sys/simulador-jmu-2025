/**
 * Cálculos de Férias - JMU
 * 
 * Responsável por calcular:
 * - Férias (1/3 Constitucional)
 * - IR sobre Férias
 * 
 * Baseado em LEGACY_FORMULAS.md seção 7 (L312-317, L284-292)
 */

import { DEDUCAO_DEP, HISTORICO_IR } from '../../../../../data';
import { calculateIrrf } from '../../../../../core/calculations/taxUtils';
import { IJmuCalculationParams } from '../types';
import { getDataForPeriod } from './baseCalculations';

export interface VacationResult {
    value: number;
    irFerias: number;
}

/**
 * Calcula Férias (1/3 Constitucional)
 */
export function calculateVacation(params: IJmuCalculationParams): VacationResult {
    let ferias1_3 = params.ferias1_3 || 0;

    if (!params.manualFerias) {
        // Férias automáticas em Janeiro ou se há valor manual
        if (params.tipoCalculo === 'jan' || ferias1_3 > 0) {
            // Férias = 1/3 da remuneração total COM função
            const { salario, funcoes, valorVR } = getDataForPeriod(params.periodo);
            const baseVencimento = salario[params.cargo]?.[params.padrao] || 0;
            const gaj = baseVencimento * 1.40;
            const funcaoValor = params.funcao === '0' ? 0 : (funcoes[params.funcao] || 0);

            let aqTituloVal = 0;
            let aqTreinoVal = 0;
            if (params.periodo >= 1) {
                // Novo AQ: VR × Multiplicador
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

            const totalComFC = baseVencimento + gaj + aqTituloVal + aqTreinoVal +
                funcaoValor + gratVal + (params.vpni_lei || 0) +
                (params.vpni_decisao || 0) + (params.ats || 0);

            ferias1_3 = totalComFC / 3;
        }
    }
    ferias1_3 = Math.round(ferias1_3 * 100) / 100;

    // IR sobre Férias
    let irFerias = 0;
    if (ferias1_3 > 0 && !params.feriasAntecipadas) {
        const baseIRFerias = ferias1_3 - (params.dependents * DEDUCAO_DEP);
        const deductionVal = HISTORICO_IR[params.tabelaIR] || 896.00;
        irFerias = calculateIrrf(baseIRFerias, 0.275, deductionVal);
    }

    return { value: ferias1_3, irFerias };
}
