import path from 'path';
import { ConfigOptions } from '@mondo/mondo';
import express, { Express, NextFunction, Request, Response } from 'express';
import { logGreen, logRed } from '@/utils/logger.js';
import { generateMergedRoutes, resolveRoute } from '@/utils/router.js';
import { TemplateEngine } from '@/utils/templates.js';
import { getSiteInternals } from '@/utils/internals.js';
import { compileAndRunTS } from '@/utils/compileAndRunTs.js';
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
const app: Express = express();

/** Parse and compile the data from the mondo.config.ts file  */
const configPath = path.join(process.cwd(), 'mondo.config.ts');
const CONFIG_FILE_DATA = await compileAndRunTS(configPath);

const internals = getSiteInternals(CONFIG_FILE_DATA);

const {
	viewsDirectory,
	globalDataDirectory,
	templateEngine,
	staticFilesRoute,
	staticFilesPath,
	pagesDirectory,
	port,
} = configureAppInternals(internals);

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

	/**
	 *  Handles nested slugs like /pages/nested-page/test
	 * also make sure the '/' doesn't act like a catch-all
	 * for every root-level route.
	 * */
	const getPath = routeName === '/' ? routeName : `${routeName}(*)?`;

	app.get(
		getPath,
		async (req: Request, res: Response, next: NextFunction) => {
			const pageData = await data.createPage(req);

			if (pageData) {
				const outputHTML = await engine._renderTemplate(
					pageData?.template,
					pageData
				);

				res.setHeader('Content-Type', 'text/html');
				res.send(outputHTML);
			} else {
				/* Send to 404 if there is no data sent to template */
				res.status(404);
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
	/**
	 *  Start the server on port + 1 so the live reloading proxy can be the correct port value
	 * NOTE: This should only happen in dev, since the app should start on the config specified
	 * port in production
	 */
	logGreen(`Server started on port: http://localhost:${port + 1}`);
});
