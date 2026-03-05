/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    50: '#E8EDF5',
                    100: '#C5D0E5',
                    200: '#9BAFD1',
                    300: '#7190BD',
                    400: '#4A72A9',
                    500: '#1B2A4A',
                    600: '#182442',
                    700: '#141E38',
                    800: '#10182E',
                    900: '#0C1224',
                    950: '#0A0F1D',
                },
                brand: {
                    orange: '#E8751A',
                    'orange-light': '#F09030',
                    'orange-dark': '#CC6215',
                },
                dark: {
                    bg: '#0B1120',
                    card: '#111B2E',
                    input: '#1A2540',
                    hover: '#1E2D48',
                    border: '#2A3A55',
                },
                status: {
                    pending: '#FFC107',
                    review: '#2196F3',
                    verified: '#4CAF50',
                    rejected: '#F44336',
                }
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans Telugu', 'system-ui', 'sans-serif'],
                telugu: ['Noto Sans Telugu', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
