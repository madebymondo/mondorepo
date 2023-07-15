import { DynamicallyImportedFile, ConfigOptions } from '@mondo/mondo';

export const DEFAULT_MONDO_CONFIGURATION: ConfigOptions = {
	root: 'src',
	port: 3000,
};

/**
 * Formats the data from the mondo.config.ts file
 *
 * @param config Data from dynamically imported mondo.config.ts
 * @returns Parsed configuration data
 */
export function getSiteInternals(
	config?: DynamicallyImportedFile | undefined
): ConfigOptions {
	const parsedConfiguration = DEFAULT_MONDO_CONFIGURATION;

	if (config) {
		const configData = config[0]?.callback;

		parsedConfiguration['root'] = setValueWithFallback(
			configData?.root,
			parsedConfiguration['root']
		);
		parsedConfiguration['port'] = setValueWithFallback(
			configData?.port,
			parsedConfiguration['port']
		);
	}

	return parsedConfiguration;
}

/**
 * Checks if a certain value exists. If not it returns a fallback value
 *
 * @param value Optimistic value
 * @param fallbackValue  Fallback value if the optimistic value doesn't exist
 * @returns
 */
function setValueWithFallback(value, fallbackValue) {
	if (value) {
		return value;
	}

	return fallbackValue;
}
