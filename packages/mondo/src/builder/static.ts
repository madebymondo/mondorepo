import { ConfigOptions, CreatePage } from '@mondo/mondo';
import { outputFile } from '@/utils/files.js';
import { generateMergedRoutes, resolveRoute } from '@/utils/router.js';
import { logRed } from '@/utils/logger.js';
import { TemplateEngine } from '@/utils/templates.js';
import path from 'path';

export async function buildStaticSite(options: ConfigOptions) {
	const pagesDirectory = options.pagesDirectory as string;
	const viewsDirectory = options.viewsDirectory as string;
	const buildDirectory = options.buildDirectory as string;
	const templateEngine = options.server.templateEngine;

	const mergedRoutes = generateMergedRoutes(pagesDirectory);

	const engine = new TemplateEngine({
		engine: templateEngine,
		viewsDirectory,
	});

	// TODO: figure out how to implement global data files
	// it can probably be passed in engine._renderTemplate as part
	// of the data e.g. {...globalData, createdPage}
	for await (const routeFile of mergedRoutes) {
		const route = await resolveRoute({ routeFile, pagesDirectory });
		const { data, routeName } = route;

		if (!data.createPage) {
			throw new Error(
				logRed(
					`Failed generating static route ${route.routeName}. No createPage function found`
				)
			);
		}

		/** Make sure that all dynamic routes have a createPaths function */
		if (route.isDynamicRoute) {
			if (!data.createPaths) {
				throw new Error(
					logRed(
						`Failed generating dynamic static route ${route.routeName}. No createPaths function found`
					)
				);
			}

			const dynamicRoutesToGenerate = await data.createPaths();

			for await (const dynamicRoute of dynamicRoutesToGenerate) {
				let dynamicRoutePath = routeName;

				route.dynamicRouteParams?.forEach((param) => {
					const replacedParam = dynamicRoute[param];

					dynamicRoutePath = dynamicRoutePath.replace(
						`:${param}`,
						replacedParam
					);
				});

				const dynamicRouteBuildPath = path.join(
					buildDirectory,
					dynamicRoutePath,
					'/index.html'
				);

				const dynamicRouteContext = {
					params: dynamicRoute,
				};

				const createdDynamicRoute = await data.createPage(
					dynamicRouteContext
				);

				const compiledDynamicRoute = await engine._renderTemplate(
					createdDynamicRoute.template,
					createdDynamicRoute,
					'build'
				);

				outputFile(dynamicRouteBuildPath, compiledDynamicRoute);
			}
		} else {
			const createdPage = await data.createPage();

			const compiledStaticRoute = await engine._renderTemplate(
				createdPage.template,
				createdPage,
				'build'
			);
			const staticRouteBuildPath = path.join(
				buildDirectory,
				routeName,
				'/index.html'
			);

			outputFile(staticRouteBuildPath, compiledStaticRoute);
		}
	}
}
