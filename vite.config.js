import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { visualizer } from "rollup-plugin-visualizer";
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
	plugins: [react(), createHtmlPlugin({
      inject: {
        data: {
          title: "ANIRBAN'S ACADEMY",
        },
      },
    }), visualizer({ open: false, gzipSize: true, brotliSize: true })],
	server: {
		cors: true,
		allowedHosts: true,
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});

