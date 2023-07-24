/** Production server file */
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
//@ts-ignore
import CONFIG_DATA from './config.json' assert { type: 'json' };
//@ts-ignore
import { TemplateEngine, generateMergedRoutes, mergeDeep } from '@mondo/mondo';

const { server, buildDirectory, viewsDirectory } = CONFIG_DATA;
const { port, templateEngine } = server;

const app: Express = express();

/**
 *  Make sure static routes and dynamic routes with more depth
 * are prioritized
 */
const mergedRoutes = generateMergedRoutes(path.join(buildDirectory, 'pages'));

app.use('/public', express.static(path.join(buildDirectory, 'public')));

app.use('/', express.static(path.join(buildDirectory, 'html')));

//TODO: Implement global data

const engine = new TemplateEngine({
	engine: templateEngine,
	viewsDirectory,
	app,
});

for (const routeFile of mergedRoutes) {
	const route = await import(routeFile);

	const routeName = routeFile
		.replace(`${buildDirectory}/pages`, '')
		.replace('[', ':')
		.replace(']', '')
		.replace('index', '')
		.replace('.js', '');

	/**
	 *  Handles nested slugs like /pages/nested-page/test
	 * also make sure the '/' doesn't act like a catch-all
	 * for every root-level route.
	 * */
	const getPath = routeName === '/' ? routeName : `${routeName}(*)?`;

	app.get(
		getPath,
		async (req: Request, res: Response, next: NextFunction) => {
			const pageData = await route.createPage(req);

			if (pageData) {
				if (pageData) {
					const outputHTML = await engine._renderTemplate(
						pageData?.template,
						/** Pass a combined object of page and global data */
						mergeDeep(pageData, app.locals)
					);

					res.setHeader('Content-Type', 'text/html');
					res.send(outputHTML);
				} else {
					/* Send to 404 if there is no data sent to template */
					res.status(404);
					next();
				}
			}
		}
	);
}

/* 404 catch-all */
app.get('*', (req: Request, res: Response, next: NextFunction) => {
	res.status(404);
	res.send('Page not found');
});

app.listen(port, () =>
	console.log(`Server started on http://localhost:${port}`)
);
