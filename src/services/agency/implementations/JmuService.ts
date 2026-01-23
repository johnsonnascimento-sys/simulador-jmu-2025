/**
 * JMU Service - Orquestrador de Cálculos
 * 
 * Service principal para cálculos da Justiça Militar da União (JMU).
 * Implementa a interface IAgencyCalculator e delega cálculos específicos
 * para módulos especializados.
 * 
 * Arquitetura Modular:
 * - modules/baseCalculations.ts - Vencimento, GAJ, FC, AQ
 * - modules/benefitsCalculations.ts - Auxílios
 * - modules/vacationCalculations.ts - Férias
 * - modules/thirteenthCalculations.ts - 13º Salário
 * - modules/overtimeCalculations.ts - Hora Extra
 * - modules/substitutionCalculations.ts - Substituição
 * - modules/dailiesCalculations.ts - Diárias
 * - modules/leaveCalculations.ts - Licença Compensatória
 * - modules/deductionsCalculations.ts - PSS, IRRF, Funpresp
 */

import { IAgencyCalculator, ICalculationResult } from '../types';
import { IJmuCalculationParams } from './jmu/types';

// Importar módulos de cálculo
import { calculateBase, calculateBaseComponents } from './jmu/modules/baseCalculations';
import { calculateBenefits } from './jmu/modules/benefitsCalculations';
import { calculateVacation } from './jmu/modules/vacationCalculations';
import { calculateThirteenth } from './jmu/modules/thirteenthCalculations';
import { calculateOvertime } from './jmu/modules/overtimeCalculations';
import { calculateSubstitution } from './jmu/modules/substitutionCalculations';
import { calculateDailies } from './jmu/modules/dailiesCalculations';
import { calculateCompensatoryLeave } from './jmu/modules/leaveCalculations';
import { calculateDeductions } from './jmu/modules/deductionsCalculations';

/**
 * Service de Cálculo da JMU
 * 
 * Orquestra todos os cálculos delegando para módulos especializados.
 */
export class JmuService implements IAgencyCalculator {

    /**
     * Calcula o total da remuneração com todos os componentes
     * 
     * Este é o método principal que orquestra todos os cálculos:
     * 1. Base salarial (vencimento, GAJ, FC, AQ, gratificações)
     * 2. Benefícios (auxílios)
     * 3. Rendimentos variáveis (férias, 13º, HE, substituição, diárias, licença)
     * 4. Deduções (PSS, IRRF, Funpresp)
     * 5. Total líquido
     */
    calculateTotal(params: IJmuCalculationParams): ICalculationResult {
        // 1. Calcular Base Salarial
        const base = calculateBase(params);
        const baseComponents = calculateBaseComponents(params);

        // 2. Calcular Benefícios
        const benefits = calculateBenefits(params);

        // 3. Calcular Rendimentos Variáveis
        const vacation = calculateVacation(params);
        const thirteenth = calculateThirteenth(params);
        const overtime = calculateOvertime(params);
        const substitution = calculateSubstitution(params);
        const dailies = calculateDailies(params);
        const compensatoryLeave = calculateCompensatoryLeave(params);

        // 4. Calcular Deduções
        const deductions = calculateDeductions(base, params);
        const abonoPerm = params.recebeAbono ? deductions.pss : 0;

        // 5. Calcular Totais
        const totalGross = base + abonoPerm + benefits.auxAlimentacao + benefits.auxPreEscolar +
            benefits.auxTransporte + vacation.value + thirteenth.adiant13Venc +
            thirteenth.adiant13FC + thirteenth.gratNatalinaTotal + overtime.heTotal +
            substitution + dailies.valor + compensatoryLeave;

        const totalDeductions = deductions.total + benefits.auxTransporteDebito +
            (params.discounts || 0) + (params.otherDeductions || 0) +
            vacation.irFerias + thirteenth.pss13 + thirteenth.ir13;

        // 6. Retornar Resultado Completo
        return {
            netSalary: totalGross - totalDeductions,
            totalDeductions: totalDeductions,
            totalBenefits: benefits.auxAlimentacao + benefits.auxPreEscolar +
                benefits.auxTransporte + dailies.valor + compensatoryLeave,
            breakdown: {
                // Componentes Base Individuais
                vencimento: baseComponents.vencimento,
                gaj: baseComponents.gaj,
                funcaoValor: baseComponents.funcaoValor,
                aqTitulo: baseComponents.aqTitulo,
                aqTreino: baseComponents.aqTreino,
                gratEspecifica: baseComponents.gratEspecifica,
                vpniLei: baseComponents.vpniLei,
                vpniDecisao: baseComponents.vpniDecisao,
                ats: baseComponents.ats,

                // Soma Total Base (compatibilidade)
                base: base,
                abono: abonoPerm,

                // Deduções
                pss: deductions.pss,
                irrf: deductions.irrf,
                funpresp: deductions.funpresp,

                // Férias
                feriasConstitucional: vacation.value,
                impostoFerias: vacation.irFerias,

                // 13º Salário
                gratificacaoNatalina: thirteenth.gratNatalinaTotal,
                abono13: thirteenth.abono13,
                imposto13: thirteenth.ir13,
                pss13: thirteenth.pss13,
                adiant13Venc: thirteenth.adiant13Venc,
                adiant13FC: thirteenth.adiant13FC,

                // Hora Extra e Substituição
                heVal50: overtime.heVal50,
                heVal100: overtime.heVal100,
                heTotal: overtime.heTotal,
                substituicao: substitution,

                // Diárias e Licença
                diariasValor: dailies.valor,
                diariasBruto: dailies.bruto,
                diariasGlosa: dailies.glosa,
                diariasDeducoes: dailies.deducoes,
                licencaCompensatoria: compensatoryLeave,

                // Benefícios
                ...benefits
            }
        };
    }
}
