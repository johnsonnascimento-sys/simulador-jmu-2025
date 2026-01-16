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
            colors: {
                primary: "#14b8a6",
                secondary: "#2563eb",
                "navy-dark": "#0f172a",
                "background-light": "#f8fafc",
                "background-dark": "#0f172a",
            },
            fontFamily: {
                display: ["Plus Jakarta Sans", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.75rem",
            },
        },
    },
    plugins: [],
}
