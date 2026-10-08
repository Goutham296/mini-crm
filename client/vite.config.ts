import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (!env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL is not set. Copy .env.example to .env (or set it in your host, e.g. Vercel/Netlify) with your API origin, e.g. VITE_API_URL=https://your-api.onrender.com',
    );
  }
  return { plugins: [react(), tailwindcss()] };
});
