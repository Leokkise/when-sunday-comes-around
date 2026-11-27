import { defineConfig } from 'vite'
import tailwind from '@tailwindcss/vite'
export default defineConfig({ plugins: [tailwind()], build: { assetsInlineLimit: 0, rollupOptions: { input: ["index.html", "wash-up/index.html", "brush-teeth/index.html", "dress-up/index.html", "basketball/index.html", "go-grow-glow/index.html", "pantry/index.html"] } } })
