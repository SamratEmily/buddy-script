import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/assets/css/app.css', 'resources/assets/js/app.tsx'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        // bind to all addresses (IPv4 + IPv6) so browsers using ::1 can reach Vite dev server
        host: true,
        port: 5173,
    },
});
