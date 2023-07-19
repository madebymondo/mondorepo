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

/**
 * Compiles a typescript route file and returns
 * a formatted object that can be used to generate
 * routes.
 *
 * @param routeFile Route file path
 */
export async function resolveRoute(
	routeFile: string
): Promise<ResolveRouteResults> {
	let isDynamicRoute: ResolveRouteResults['isDynamicRoute'] = false;
	let routeName: ResolveRouteResults['routeName'] = undefined;
	let dynamicRouteParams: ResolveRouteResults['dynamicRouteParams'] =
		undefined;

	/** Dynamic routes start with '[' (example: [slug].ts) */
	if (routeFile.includes('[')) {
		isDynamicRoute = true;
		/* Get the content between the [] */
		dynamicRouteParams = [...routeFile.matchAll(/\[(.*?)\]/g)].map(
			(route) => route[1]
		);
	} else {
		/** If the route isn't dynamic just replace the file extension */
		routeName = routeFile.replace('.ts', '');
	}

	const data = await compileAndRunTS(routeFile);

	return { routeName, isDynamicRoute, dynamicRouteParams, data };
}
