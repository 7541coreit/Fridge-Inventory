import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: process.env.GITHUB_PAGES === 'true' ? '/Fridge-Inventory/' : '/',
  server: {
    port: 7173,
    host: true
  }
});
