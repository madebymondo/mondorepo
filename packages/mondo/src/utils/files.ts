import fs from 'fs';
import { logRed, logGreen } from '@/utils/logger.js';

/**
 * Takes a nested file path and outputs a file
 * */
export function outputFile(path: string, contents: any) {
	/**
	 * If the path doesnt exists create the nested
	 * directory structure.
	 */
	if (!fs.existsSync(path)) {
		const outputPath = path;
		const fileName = outputPath.split('/').pop() as string;
		const nestedDirectoryStucture = outputPath.replace(fileName, '');

		fs.mkdirSync(nestedDirectoryStucture, { recursive: true });
	}

	try {
		fs.writeFileSync(path, contents, { encoding: 'utf-8' });
		logGreen(`Successfully created ${path}`);
	} catch (e) {
		throw new Error(logRed(`Error creating file ${path}`), e);
	}
}
