import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    base: '/enkelbolanekalkylator/',
    plugins: [react()],
    server: {
        port: 5173,
        open: true
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        clearMocks: true,
    }
});
