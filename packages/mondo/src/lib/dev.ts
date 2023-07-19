import { ConfigOptions } from '@mondo/mondo';
import path from 'path';
import fs from 'fs';
import express, { Express, Request, Response } from 'express';
import { compileAndRunTS } from '@/utils/compileAndRunTs.js';
import { walkSync, resolveRoute } from '@/utils/router.js';
import {
	configureAppInternals,
	initialzeGlobalDataMiddleware,
} from '@/utils/server.js';

export interface RunDevServerOptions {
	internals: ConfigOptions;
}

export async function runDevServer(options: RunDevServerOptions) {
	const app: Express = express();

	const {
		rootDirectory,
		viewsDirectory,
		globalDataDirectory,
		templateEngine,
		staticFilesRoute,
		staticFilesPath,
		port,
	} = configureAppInternals(options.internals);

	/* Set global data for app */
	initialzeGlobalDataMiddleware({ app, globalDataDirectory });

	/* Configure middleware to serve static files */
	app.use(staticFilesRoute, express.static(staticFilesPath));

	app.get('/', (req: Request, res: Response) => {
		res.json({ message: `page is working on: ${port}` });
	});

	/* 404 catch-all */
	app.get('*', (req: Request, res: Response) => {
		res.status(404);
		res.send('Page not found');
	});

	app.listen(port, () => {
		console.log(`Server started on port: http://localhost:${port}`);
	});
}
