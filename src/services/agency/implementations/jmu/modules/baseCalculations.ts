/**
 * Cálculos de Base Salarial - JMU
 * 
 * Responsável por calcular:
 * - Vencimento base
 * - GAJ (Gratificação de Atividade Judiciária)
 * - Função Comissionada
 * - AQ (Adicional de Qualificação) - Sistema antigo e novo
 * - Gratificações Específicas (GAE/GAS)
 * - VPNI e ATS
 */

import { BASES_2025, CJ1_INTEGRAL_BASE } from '../../../../../data';
import { calcReajuste } from '../../../../../utils/calculations';
import { IJmuCalculationParams } from '../types';

/**
 * Obtém dados ajustados para o período (bases salariais e VR)
 */
export function getDataForPeriod(periodo: number) {
    const steps = periodo >= 2 ? periodo - 1 : 0;

    // Deep copy and adjust bases
    const sal = JSON.parse(JSON.stringify(BASES_2025.salario));
    for (let cargo in sal) {
        for (let padrao in sal[cargo]) {
            sal[cargo][padrao] = calcReajuste(sal[cargo][padrao], steps);
        }
    }

    const func = JSON.parse(JSON.stringify(BASES_2025.funcoes));
    for (let key in func) {
        func[key] = calcReajuste(func[key], steps);
    }

    const cj1Adjusted = calcReajuste(CJ1_INTEGRAL_BASE, steps);
    const valorVR = Math.round(cj1Adjusted * 0.065 * 100) / 100;

    return { salario: sal, funcoes: func, valorVR };
}

/**
 * Calcula a remuneração base total
 */
export function calculateBase(params: IJmuCalculationParams): number {
    const { salario, funcoes, valorVR } = getDataForPeriod(params.periodo);

    const baseVencimento = salario[params.cargo]?.[params.padrao] || 0;
    const gaj = baseVencimento * 1.40; // JMU Rule: GAJ is 140%
    const funcaoValor = params.funcao === '0' ? 0 : (funcoes[params.funcao] || 0);

    // AQ - Adicional de Qualificação (Lei 15.292/2025)
    let aqTituloVal = 0;
    let aqTreinoVal = 0;

    if (params.periodo >= 1) {
        // Novo AQ: VR × Multiplicador
        // VALIDAÇÃO: Detectar valores incorretos (cache antigo)
        if (params.aqTituloVR > 10 || params.aqTreinoVR > 10) {
            console.error('⚠️ ERRO: Multiplicadores AQ incorretos!', {
                aqTituloVR: params.aqTituloVR,
                aqTreinoVR: params.aqTreinoVR,
                valorVR,
                periodo: params.periodo
            });
            console.warn('🔄 Possível cache antigo detectado. Por favor, atualize a página e selecione novamente os valores de AQ.');
        }

        aqTituloVal = valorVR * params.aqTituloVR;
        aqTreinoVal = valorVR * params.aqTreinoVR;
    } else {
        // Antigo AQ: Percentual direto do vencimento
        aqTituloVal = baseVencimento * params.aqTituloPerc;
        aqTreinoVal = baseVencimento * params.aqTreinoPerc;
    }

    // Gratificação Específica
    let gratVal = 0;
    if (params.gratEspecificaTipo === 'gae' || params.gratEspecificaTipo === 'gas') {
        gratVal = baseVencimento * 0.35; // JMU Rule: 35%
    } else {
        gratVal = params.gratEspecificaValor || 0;
    }

    // VPNI + ATS
    const extras = (params.vpni_lei || 0) + (params.vpni_decisao || 0) + (params.ats || 0);

    return baseVencimento + gaj + funcaoValor + aqTituloVal + aqTreinoVal + gratVal + extras;
}

/**
 * Calcula componentes individuais da base para breakdown detalhado
 * IMPORTANTE: Usado para mapear de volta para o React state
 */
export function calculateBaseComponents(params: IJmuCalculationParams) {
    const { salario, funcoes, valorVR } = getDataForPeriod(params.periodo);

    const baseVencimento = salario[params.cargo]?.[params.padrao] || 0;
    const gaj = baseVencimento * 1.40;
    const funcaoValor = params.funcao === '0' ? 0 : (funcoes[params.funcao] || 0);

    let aqTituloVal = 0;
    let aqTreinoVal = 0;
    if (params.periodo >= 1) {
        // Novo AQ: VR × Multiplicador (Lei 15.292)
        aqTituloVal = valorVR * params.aqTituloVR;
        aqTreinoVal = valorVR * params.aqTreinoVR;
    } else {
        // Antigo AQ: Percentual do vencimento
        aqTituloVal = baseVencimento * params.aqTituloPerc;
        aqTreinoVal = baseVencimento * params.aqTreinoPerc;
    }

    let gratVal = 0;
    if (params.gratEspecificaTipo === 'gae' || params.gratEspecificaTipo === 'gas') {
        gratVal = baseVencimento * 0.35;
    } else {
        gratVal = params.gratEspecificaValor || 0;
    }

    return {
        vencimento: baseVencimento,
        gaj,
        funcaoValor,
        aqTitulo: aqTituloVal,
        aqTreino: aqTreinoVal,
        gratEspecifica: gratVal,
        vpniLei: params.vpni_lei || 0,
        vpniDecisao: params.vpni_decisao || 0,
        ats: params.ats || 0
    };
}
