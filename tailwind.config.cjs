const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				serif: ["Cormorant Garamond", "Cormorant", ...defaultTheme.fontFamily.serif]
			},
			colors: {
				offBlack: "#03090f",
				secondary: "#EDEDED"
			},
			keyframes: {
				'move-left': {
					'from': { opacity:"0" },
					'to': { transform: 'translateX(0)',opacity:"1" }

				}
			},
			animation: {
				'move-left': 'move-left 0.2s ease-out forwards'
			},
		},
	},
	plugins: [],
}
