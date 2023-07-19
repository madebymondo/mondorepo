import { ConfigOptions, DefaultDynamicallyImportedFile } from '@mondo/mondo';
import path from 'path';

const ROOT_PATH = path.join(process.cwd(), 'src');

export const DEFAULT_MONDO_CONFIGURATION: ConfigOptions = {
	root: ROOT_PATH,
	pagesDirectory: path.join(ROOT_PATH, 'pages'),
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
		parsedConfiguration = { ...DEFAULT_MONDO_CONFIGURATION, ...configData };
	}

	return parsedConfiguration;
}

/**
 * Wrapper used to get type checking for configuration options
 *
 * @param callback Callback funtion that returns config options
 * */
export function defineConfig(callback: () => ConfigOptions): ConfigOptions {
	return callback();
}
