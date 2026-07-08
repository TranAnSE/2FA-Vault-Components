/// <reference types="vitest" />

import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        Vue()
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.js'],
    },
    build: {
        lib: {
            formats: ['es'],
            name: 'formcontrols',
            fileName: (_,name) => `${name}.mjs`,
            entry: {
                index: resolve(__dirname,'src/index.js'),
            },
        },
        rollupOptions: {
            external: [
                'vue',
                '@vueuse/core',
                '@vueuse/components',
                '@2fauth/ui',
                '@lucide/vue',
            ],
        },
    },
})