import { ConfigOptions } from '@madebymondo/mondo';
import { outputFile } from '@/utils/files.js';
import { generateMergedRoutes, resolveRoute } from '@/utils/router.js';
import { logRed, logYellow } from '@/utils/logger.js';
import { TemplateEngine } from '@/utils/templates.js';
import { compileAndRunTS } from '@/utils/compileAndRunTs.js';
import path from 'path';
import fs from 'fs';
import { mergeDeep } from '@/utils/helpers.js';

/**
 * Gets all the global data and creates a single object that can be used in the templates.
 * It handles the generation of static HTML files for the 'ssg' render mode and 'server' routes
 * that are set to be pre-rendered.
 *
 * @param globalDataDirectory Path to the globalDataDirectory set in config. Defaults to 'src/data'
 * @returns An object of global data values to send to the template
 */
export async function getStaticGlobalData(globalDataDirectory: string) {
	const globalDataDirectoryExists = fs.existsSync(globalDataDirectory);

	if (!globalDataDirectoryExists) {
		logYellow(
			`No global data directory found at path: ${globalDataDirectory}`
		);
	}

	if (globalDataDirectoryExists) {
		if (globalDataDirectoryExists) {
			const globalDataFiles = fs.readdirSync(globalDataDirectory);
			const globalData = {};

			for await (const dataFile of globalDataFiles) {
				/* Read each data file and get it's default exported function */
				const dataFileFunctions = await compileAndRunTS(
					path.join(globalDataDirectory, dataFile)
				);

				const dataFileContents = dataFileFunctions.default;

				/* Get the name of the file and the return value
					of the callback */
				const dataBasename = dataFile
					.replace(globalDataDirectory, '')
					.replace('.js', '')
					.replace('.ts', '');

				const data = await dataFileContents();

				globalData[dataBasename] = data;
			}

			return globalData;
		}
	}
}

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
	const globalDataDirectory = options.globalDataDirectory as string;
	const templateEngine = options.server.templateEngine;
	const renderMode = options.renderMode as string;

	const mergedRoutes = generateMergedRoutes(pagesDirectory);

	const engine = new TemplateEngine({
		engine: templateEngine,
		viewsDirectory,
	});

	const globalData = await getStaticGlobalData(globalDataDirectory);

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
			if (!data.createPaths && renderMode === 'ssg') {
				throw new Error(
					logRed(
						`Failed generating dynamic route ${route.routeName}. The 'createPaths' function is 
						required for any route that does not include 'prerender: true' or is using the server
						render mode`
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

				/**
				 * Generate the dynamic route if it should be prerendered
				 * or is using ssg as the renderMode
				 */

				if (createdDynamicRoute.prerender || renderMode === 'ssg') {
					const compiledDynamicRouteHTML =
						await engine._renderTemplate(
							createdDynamicRoute.template,
							mergeDeep(globalData, createdDynamicRoute),
							'build'
						);

					outputFile(dynamicRouteBuildPath, compiledDynamicRouteHTML);
				}
			}
		} else {
			/** Get data passed to template  */
			const createdPage = await data.createPage();

			/**
			 * Generate the static file if it should be prerendered
			 * or is using ssg as the renderMode
			 */
			if (createdPage.prerender || renderMode === 'ssg') {
				/**  Get the generated HTML and build path */
				const compiledStaticRouteHTML = await engine._renderTemplate(
					createdPage.template,
					mergeDeep(globalData, createdPage),
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
}
