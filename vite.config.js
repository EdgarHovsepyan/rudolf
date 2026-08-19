/* eslint-env node */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * BASE_PATH задаёт подпапку хостинга: на GitHub Pages это "/rudolf/", локально и на
 * собственном домене "/". SPA-fallback: GitHub Pages отдаёт 404.html для любого
 * неизвестного пути, поэтому копия index.html под этим именем открывает /about и /gallery.
 */
const spaFallback = () => ({
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
        const dist = resolve(root, 'dist');
        copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
    },
});

export default defineConfig({
    base: process.env.BASE_PATH || '/',
    plugins: [react(), spaFallback()],
    build: {
        chunkSizeWarningLimit: 1200, // three + drei в ленивом чанке сцены, это ожидаемо
        rollupOptions: {
            output: {
                manualChunks: {
                    // three отдельно от react-кода сцены: кешируется независимо при правках
                    three: ['three'],
                },
            },
        },
    },
});
