import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { '@': resolve(import.meta.dirname, '.') }
	},
	test: {
		env: {
			NEXT_PUBLIC_API_URL: 'http://localhost:3001',
			NEXT_PUBLIC_DISCORD_CLIENT_ID: '000000000000000000'
		},
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		include: ['**/*.test.{ts,tsx}'],
		exclude: ['node_modules', '.next']
	}
});
