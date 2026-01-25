/**
 * Cálculos de Diárias de Viagem - JMU
 * 
 * Responsável por calcular:
 * - Diárias de viagem
 * - Adicional de embarque
 * - Glosas externas
 * - Deduções internas (alimentação e transporte)
 * 
 * Baseado em LEGACY_FORMULAS.md seção 10 (L341-393)
 */

import { IJmuCalculationParams } from '../types';
import { calculateBenefits } from './benefitsCalculations';

export interface DailiesResult {
    valor: number;
    bruto: number;
    glosa: number;
    deducoes: number;
}

/**
 * Calcula Diárias de Viagem
 */
export async function calculateDailies(params: IJmuCalculationParams): Promise<DailiesResult> {
    // 1. Determinar valor da diária por cargo/função
    let valorDiaria = 0;
    if (params.funcao && params.funcao.toLowerCase().startsWith('cj')) {
        valorDiaria = 880.17;  // CJ
    } else if (params.cargo === 'analista') {
        valorDiaria = 806.82;  // Analista
    } else {
        valorDiaria = 660.13;  // Técnico
    }

    // 2. Adicional de embarque
    let adicionalEmbarque = 0;
    if (params.diariasEmbarque === 'completo') {
        adicionalEmbarque = 586.78;
    } else if (params.diariasEmbarque === 'metade') {
        adicionalEmbarque = 293.39;
    }

    // 3. Bruto
    const diariasBruto = (params.diariasQtd * valorDiaria) + adicionalEmbarque;

    // 4. Glosa Externa (reduções percentuais)
    let percentGlosa = 0;
    if (params.diariasExtHospedagem) percentGlosa += 0.55;   // 55%
    if (params.diariasExtAlimentacao) percentGlosa += 0.25;  // 25%
    if (params.diariasExtTransporte) percentGlosa += 0.20;   // 20%
    const glosaExterno = (params.diariasQtd * valorDiaria) * percentGlosa;

    // 5. Deduções Internas
    const totalDiasViagem = params.diariasQtd;
    let deducaoAlimentacao = 0;
    if (params.diariasDescontarAlimentacao && totalDiasViagem > 0) {
        deducaoAlimentacao = (params.auxAlimentacao / 30) * totalDiasViagem;
    }

    // Aux Transporte (obter do cálculo de benefícios)
    const benefits = await calculateBenefits(params);
    let deducaoTransporte = 0;
    if (params.diariasDescontarTransporte && totalDiasViagem > 0) {
        deducaoTransporte = (benefits.auxTransporte / 30) * totalDiasViagem;
    }

    const totalDeducoes = deducaoAlimentacao + deducaoTransporte;

    // 6. Líquido (mínimo zero)
    const valor = Math.max(0, diariasBruto - glosaExterno - totalDeducoes);

    return {
        valor: Math.round(valor * 100) / 100,
        bruto: Math.round(diariasBruto * 100) / 100,
        glosa: Math.round(glosaExterno * 100) / 100,
        deducoes: Math.round(totalDeducoes * 100) / 100
    };
}
