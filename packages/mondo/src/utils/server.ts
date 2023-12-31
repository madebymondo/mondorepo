import { ConfigOptions } from '@/types/mondo.js';
import path from 'path';
import fs from 'fs';
import { logYellow } from '@/utils/logger.js';
import { Express } from 'express';

export interface ConfigureAppInternalsResults {
	rootDirectory: string;
	viewsDirectory: string;
	globalDataDirectory: string;
	pagesDirectory: string;
	templateEngine: ConfigOptions['server']['templateEngine'];
	staticFilesRoute: string;
	staticFilesPath: string;
	templateFilters: ConfigOptions['templateFilters'];
	port: number;
}

/**
 * Parses the configuration file and returns the options
 * or fallback value
 * */
export function configureAppInternals(
	options: ConfigOptions
): ConfigureAppInternalsResults {
	const serverOptions = options?.server;
	const rootDirectory = options?.root ?? path.join(process.cwd(), 'src');

	const pagesDirectory =
		options?.pagesDirectory ?? path.join(rootDirectory, 'pages');
	const viewsDirectory =
		options?.viewsDirectory ?? path.join(rootDirectory, 'views');
	const globalDataDirectory =
		options?.globalDataDirectory ?? path.join(rootDirectory, 'views');

	const staticFilesRoute = serverOptions?.staticFilesRoute ?? '/public';
	const staticFilesPath =
		serverOptions?.staticFilesPath ?? path.join(process.cwd(), 'public');
	const templateEngine = serverOptions?.templateEngine ?? 'njk';
	const templateFilters = options?.templateFilters ?? undefined;

	const port = serverOptions?.port ?? 3000;

	return {
		rootDirectory,
		globalDataDirectory,
		pagesDirectory,
		viewsDirectory,
		templateEngine,
		staticFilesRoute,
		staticFilesPath,
		templateFilters,
		port,
	};
}

export interface InitialzeGlobalDataMiddlewareOptions {
	/** Express app */
	app: Express;
	/** Path to global data directory */
	globalDataDirectory: string;
}

/**
 * Runs each data file in the globalDataDirectory and sets the value to app.locals
 * */
export function initialzeGlobalDataMiddleware(
	options: InitialzeGlobalDataMiddlewareOptions
) {
	const { app, globalDataDirectory } = options;

	const globalDataDirectoryExists = fs.existsSync(globalDataDirectory);

	if (!globalDataDirectory) {
		logYellow(
			`No global data directory found at path: ${globalDataDirectory}`
		);
	}

	if (globalDataDirectoryExists) {
		const globalDataFiles = fs.readdirSync(globalDataDirectory);

		(async function () {
			for await (const dataFile of globalDataFiles) {
				/* Read each data file and get it's default exported function */
				const dataFileFunctions = await import(
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

				/* Set the value of each data file to a local global
				 * variable in the app */
				app.locals[dataBasename] = data;
			}
		})();
	}
}
