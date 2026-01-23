/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    darkMode: "class",
    theme: {
        extend: {
            // Cores do Design System
            colors: {
                primary: "#14b8a6",      // Teal - Destaques, links, ícones
                secondary: "#2563eb",    // Blue - Botões principais, CTAs
                "navy-dark": "#0f172a",  // Background escuro
                "background-light": "#f8fafc",
                "background-dark": "#0f172a",
            },

            // Tipografia
            fontFamily: {
                display: ["Plus Jakarta Sans", "sans-serif"],
            },

            // Tamanhos de Fonte Padronizados
            fontSize: {
                // Títulos
                'h1': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '800' }],      // 36px
                'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],         // 24px
                'h3': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '700' }],    // 18px
                'h4': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '700' }],    // 14px

                // Labels e Body
                'label': ['0.625rem', { lineHeight: '1rem', fontWeight: '700', letterSpacing: '0.05em' }], // 10px
                'body': ['0.875rem', { lineHeight: '1.25rem' }],                     // 14px
            },

            // Border Radius Padronizado
            borderRadius: {
                'card': '1rem',      // 16px - Cards
                'input': '0.75rem',  // 12px - Inputs
                'button-sm': '0.5rem',   // 8px - Botões pequenos
                'button-md': '0.75rem',  // 12px - Botões médios
                'button-lg': '0.75rem',  // 12px - Botões grandes
            },

            // Sombras Padronizadas
            boxShadow: {
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            },
        },
    },
    plugins: [],
}
