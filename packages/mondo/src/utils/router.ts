import fs from 'fs';
import path from 'path';
import { compileAndRunTS } from '@/utils/compileAndRunTs';

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
	fileName: string;
	data: any;
}

export async function resolveRoute(
	routeFile: string
): Promise<ResolveRouteResults> {
	const fileData = await compileAndRunTS(routeFile);

	return { fileName: '', data: fileData };
}
