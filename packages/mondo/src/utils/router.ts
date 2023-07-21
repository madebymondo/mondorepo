import fs from 'fs';
import path from 'path';
import { compileAndRunTS } from '@/utils/compileAndRunTs.js';

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
	routeName?: string | undefined;
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
	let routeName: ResolveRouteResults['routeName'] = undefined;
	let dynamicRouteParams: ResolveRouteResults['dynamicRouteParams'] =
		undefined;

	routeName = routeFile.replace('.ts', '').replace(pagesDirectory, '');

	/** Dynamic routes start with '[' (example: [slug].ts) */
	if (routeFile.includes('[')) {
		isDynamicRoute = true;
		/* Get the content between the [] */
		dynamicRouteParams = [...routeFile.matchAll(/\[(.*?)\]/g)].map(
			(route) => route[1]
		);
	}

	const data = await compileAndRunTS(routeFile);

	return { routeName, isDynamicRoute, dynamicRouteParams, data };
}
