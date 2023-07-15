import { ConfigOptions } from '@mondo/mondo';
import express, { Express, Request, Response } from 'express';

interface RunDevServerOptions {
	internals: ConfigOptions;
}

export async function runDevServer(options: RunDevServerOptions) {
	const app: Express = express();

	const PORT: number = options?.internals?.port
		? options.internals.port
		: 3000;

	app.get('/', (req: Request, res: Response) => {
		res.json({ message: `page is working on: ${PORT}` });
	});

	app.listen(PORT, () => {
		console.log(`Server started on port: http://localhost:${PORT}`);
	});
}
