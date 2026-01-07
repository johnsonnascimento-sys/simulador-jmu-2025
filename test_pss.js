
const HISTORICO_PSS = {
    '2025': {
        teto_rgps: 8157.41,
        faixas: [
            { min: 0.00, max: 1518.00, rate: 0.075 },
            { min: 1518.01, max: 2793.88, rate: 0.090 },
            { min: 2793.89, max: 4190.83, rate: 0.120 },
            { min: 4190.84, max: 8157.41, rate: 0.140 },
            { min: 8157.42, max: 13969.49, rate: 0.145 },
            { min: 13969.50, max: 27938.96, rate: 0.165 },
            { min: 27938.97, max: 54480.97, rate: 0.190 },
            { min: 54480.98, max: Infinity, rate: 0.220 }
        ]
    },
    '2024': {
        teto_rgps: 7786.02,
        faixas: [
            { min: 0.00, max: 1412.00, rate: 0.075 },
            { min: 1412.01, max: 2666.68, rate: 0.090 },
            { min: 2666.69, max: 4000.03, rate: 0.120 },
            { min: 4000.04, max: 7786.02, rate: 0.140 },
            { min: 7786.03, max: 13333.48, rate: 0.145 },
            { min: 13333.49, max: 26666.94, rate: 0.165 },
            { min: 26666.95, max: 52000.54, rate: 0.190 },
            { min: 52000.55, max: Infinity, rate: 0.220 }
        ]
    }
};

const calcPSS = (base, tabelaKey) => {
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

const base = 20000;
console.log(`Base: ${base}`);
console.log(`PSS 2024: ${calcPSS(base, '2024')}`);
console.log(`PSS 2025: ${calcPSS(base, '2025')}`);
