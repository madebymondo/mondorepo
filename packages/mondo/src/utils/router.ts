import fs from 'fs';
import path from 'path';
import { logRed } from '@/utils/logger.js';

/**
 * Walks thorugh a directory and finds all available paths
 *
 * @param dir Path to directory
 */
export function* walkSync(dir: string) {
	const files = fs.readdirSync(dir, { withFileTypes: true });
	for (const file of files) {
		if (file.isDirectory()) {
			yield* walkSync(path.join(dir, file.name));
		} else {
			yield path.join(dir, file.name);
		}
	}
}

export interface ResolveRouteResults {
	/** Route name if the page isn't dynamic */
	routeName: string;
	/** Whether this file generates more than one route ([slug]) */
	isDynamicRoute: boolean;
	/** Values that are used as keys in the data when generating dynamic pages */
	dynamicRouteParams?: string[] | undefined;
	/** Main data sent to the server */
	data: any;
}

export interface ResolveRouteParams {
	/** Path to the route file */
	routeFile: string;
	/** Pages directory from config */
	pagesDirectory: string;
}

/**
 * Compiles a typescript route file and returns
 * a formatted object that can be used to generate
 * routes.
 *
 * @param routeFile Route file path
 */
export async function resolveRoute(
	params: ResolveRouteParams
): Promise<ResolveRouteResults> {
	if (!params.routeFile) {
		throw new Error('No path found for the route file.');
	}

	if (!params.pagesDirectory) {
		throw new Error('No value found for the pagesDirectory');
	}

	const { routeFile, pagesDirectory } = params;

	let isDynamicRoute: ResolveRouteResults['isDynamicRoute'] = false;
	let dynamicRouteParams: ResolveRouteResults['dynamicRouteParams'] =
		undefined;

	/** Format the route to match express params
	 *
	 * /pages/[page].ts to /pages/:page
	 */
	const routeName: ResolveRouteResults['routeName'] = routeFile
		.replace('.ts', '')
		.replace('.js', '')
		.replace(pagesDirectory, '')
		.replaceAll('[', ':')
		.replaceAll(']', '')
		// Edge case to handle any root index files in a route directory
		.replace('index', '');

	/** Dynamic routes start with '[' (example: [slug].ts) */
	if (routeFile.includes('[')) {
		isDynamicRoute = true;
		/* Get the content between the [] */
		dynamicRouteParams = [...routeFile.matchAll(/\[(.*?)\]/g)].map(
			(route) => route[1]
		);
	}

	const data = await import(routeFile);

	return { routeName, isDynamicRoute, dynamicRouteParams, data };
}

/**
 * Takes a path from the pages directory makes sure that the
 * routes are in an order that won't causing colliding with other
 * catch-all routes.
 *
 * @param routeDirectoryPath Path to a directory
 * @returns An array of routes that prioritize static and dynamic routes with
 * more depth
 */
export function generateMergedRoutes(routeDirectoryPath: string) {
	if (!routeDirectoryPath) {
		throw new Error(logRed(`No routeDirectory path is specified`));
	}
	const availableRoutes = [...walkSync(routeDirectoryPath)]
		/* Sort routes so that routes with a larger depth don't get caught
		in potential catch-all routes
		*/
		.sort((a, b) => {
			const firstRouteDepth = a.split('/').length;
			const secondRouteDepth = b.split('/').length;

			return secondRouteDepth - firstRouteDepth;
		});

	/**
	 * Break the routes up into static routes (/pages/index.ts)
	 * and dynamic routes (/pages/[page].ts). This way there
	 * is no chance for a dynamic route to override a static one
	 */
	const staticRoutes = availableRoutes.filter(
		(route) => !route.includes('[')
	);

	const dynamicRoutes = availableRoutes.filter((route) =>
		route.includes('[')
	);

	/**
	 * Merge the static and dyanmic routes together, but have
	 * the static routes take priority.
	 */
	const mergedRoutes = [...staticRoutes, ...dynamicRoutes];

	return mergedRoutes;
}
