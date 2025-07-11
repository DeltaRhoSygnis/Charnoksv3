import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        cors: true,
        headers: {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*'
        }
    },
    build: {
        target: 'esnext',
        sourcemap: true
    }
});
