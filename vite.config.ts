import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import devtools from 'vite-plugin-devtools';
import RubyPlugin from 'vite-plugin-ruby';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    RubyPlugin(),
    tailwindcss(),
    ...(mode === 'development' ? [devtools({ vconsole: true, eruda: true })] : []),
  ],
  ssr: {
    noExternal: [
      '@floating-ui/dom',
      '@floating-ui/react',
      '@inertiajs/react',
      '@inertiaui/modal-react',
      '@sentry/react',
      '@tanstack/react-table',
      'date-fns',
      'lucide-react',
      'react-day-picker',
      'react-resizable-panels',
      'recharts',
    ],
  },
  resolve: {
    alias: {
      '@/rails': path.resolve(__dirname, 'app/javascript'),
      '@': path.resolve(__dirname, 'app/frontend'),
    },
  },
}));
