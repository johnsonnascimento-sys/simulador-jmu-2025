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
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: "#3B82F6", // Blue-500
                secondary: "#10B981", // Emerald-500
                surface: "#FFFFFF",
                background: "#F3F4F6", // Gray-100
                "border-light": "#E5E7EB", // Gray-200
            },
        },
    },
    plugins: [],
}
