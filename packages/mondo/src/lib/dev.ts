import { ConfigOptions } from '@mondo/mondo';
import express, { Express, NextFunction, Request, Response } from 'express';
import { logGreen, logRed } from '@/utils/logger.js';
import { generateMergedRoutes, resolveRoute } from '@/utils/router.js';
import { TemplateEngine } from '@/utils/templates.js';
import {
	configureAppInternals,
	initialzeGlobalDataMiddleware,
} from '@/utils/server.js';

export interface RunDevServerOptions {
	internals: ConfigOptions;
}

/**
 * Initializes and runs an Express app for the dev server
 */
export async function runDevServer(options: RunDevServerOptions) {
	const app: Express = express();

	const {
		viewsDirectory,
		globalDataDirectory,
		templateEngine,
		staticFilesRoute,
		staticFilesPath,
		pagesDirectory,
		port,
	} = configureAppInternals(options.internals);

	/* Make sure static routes and dynamic routes with more depth
	are prioritized */
	const mergedRoutes = generateMergedRoutes(pagesDirectory);

	/* Set global data for app */
	initialzeGlobalDataMiddleware({ app, globalDataDirectory });

	/* Configure middleware to serve static files */
	app.use(staticFilesRoute, express.static(staticFilesPath));

	const engine = new TemplateEngine({
		engine: templateEngine,
		viewsDirectory,
		app,
	});

	for (const route of mergedRoutes) {
		const routeResponse = await resolveRoute({
			routeFile: route,
			pagesDirectory,
		});

		const { routeName, data } = routeResponse;

		if (!data.createPage) {
			throw new Error(
				logRed(`No exported createPage function found in ${route}`)
			);
		}

		app.get(
			/* Handles nested slugs like /pages/nested-page/test */
			`${routeName}(*)?`,
			async (req: Request, res: Response, next: NextFunction) => {
				const pageData = await data.createPage(req);

				const outputHTML = await engine._renderTemplate(
					pageData.template,
					pageData
				);

				/* Send to 404 if there is no data sent to template */
				if (pageData) {
					res.setHeader('Content-Type', 'text/html');
					res.send(outputHTML);
				} else {
					next();
				}
			}
		);
	}

	/* 404 catch-all */
	app.get('*', (req: Request, res: Response) => {
		res.status(404);
		res.send('Page not found');
	});

	app.listen(port, () => {
		logGreen(`Server started on port: http://localhost:${port}`);
	});
}
