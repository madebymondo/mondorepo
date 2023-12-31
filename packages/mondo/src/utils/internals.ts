import {
	ConfigOptions,
	DefaultDynamicallyImportedFile,
} from '@/types/mondo.js';
import path from 'path';
import { mergeDeep } from '@/utils/helpers.js';

const ROOT_PATH = path.join(process.cwd(), 'src');

export const DEFAULT_MONDO_CONFIGURATION: ConfigOptions = {
	root: ROOT_PATH,
	renderMode: 'ssg',
	pagesDirectory: path.join(ROOT_PATH, 'pages'),
	buildDirectory: path.join(process.cwd(), 'build'),
	viewsDirectory: path.join(ROOT_PATH, 'views'),
	globalDataDirectory: path.join(ROOT_PATH, 'data'),
	server: {
		port: 3000,
		templateEngine: 'njk',
		staticFilesPath: path.join(ROOT_PATH, 'public'),
		staticFilesRoute: '/public',
	},
};

/**
 * Formats the data from the mondo.config.ts file
 *
 * @param config Data from dynamically imported mondo.config.ts
 * @returns Parsed configuration data
 */
export function getSiteInternals(
	config?: DefaultDynamicallyImportedFile | undefined
): ConfigOptions {
	let parsedConfiguration = DEFAULT_MONDO_CONFIGURATION;

	if (config) {
		const configData = config?.default;

		/** Merge the config file content with the fallback and make sure
		 * that the config file overrides the default.
		 */
		parsedConfiguration = mergeDeep(
			DEFAULT_MONDO_CONFIGURATION,
			configData
		);
	}

	return parsedConfiguration;
}
