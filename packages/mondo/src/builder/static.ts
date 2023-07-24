import { ConfigOptions } from '@mondo/mondo';
import { outputFile } from '@/utils/files.js';
import { generateMergedRoutes, resolveRoute } from '@/utils/router.js';
import { logRed } from '@/utils/logger.js';
import { TemplateEngine } from '@/utils/templates.js';
import path from 'path';

/**
 * Generates the HTML output for each route in the
 * pagesDirectory and writes the output to the
 * buildDirectory
 *
 * @param options Mondo config options
 */
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

		/** Pages shouldn't be generated without a createPage function */
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

			/**  Get and generated all possible dynamic routes */
			const dynamicRoutesToGenerate = await data.createPaths();

			for await (const dynamicRoute of dynamicRoutesToGenerate) {
				let dynamicRoutePath = routeName;

				/**
				 * Replace the dynamic values of the route with
				 * the matching param from the dynamicRoute.
				 *
				 * {page: '/pages/page-one'} -> /pages/:page - /pages/page-one
				 * */
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

				/** Create the context that is passed to createPage */
				const dynamicRouteContext = {
					params: dynamicRoute,
				};

				/** Get data passed to template  */
				const createdDynamicRoute = await data.createPage(
					dynamicRouteContext
				);

				const compiledDynamicRouteHTML = await engine._renderTemplate(
					createdDynamicRoute.template,
					createdDynamicRoute,
					'build'
				);

				outputFile(dynamicRouteBuildPath, compiledDynamicRouteHTML);
			}
		} else {
			/** Get data passed to template  */
			const createdPage = await data.createPage();

			/**  Get the generated HTML and build path */
			const compiledStaticRouteHTML = await engine._renderTemplate(
				createdPage.template,
				createdPage,
				'build'
			);
			const staticRouteBuildPath = path.join(
				buildDirectory,
				routeName,
				'/index.html'
			);

			outputFile(staticRouteBuildPath, compiledStaticRouteHTML);
		}
	}
}
