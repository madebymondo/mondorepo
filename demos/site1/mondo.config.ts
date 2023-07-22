import { defineConfig } from '@mondo/mondo';

export default defineConfig(() => {
	return {
		root: '/src',
		server: {
			port: 8000,
		},
	};
});
