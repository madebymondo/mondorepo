import { ConfigOptions } from '@mondo/mondo';
import path from 'path';
import fs from 'fs';
import { compileAndRunTS } from '@/utils/compileAndRunTs.js';
import { logYellow } from '@/utils/logger.js';
import { Express } from 'express';

export interface ConfigureAppInternalsResults {
	rootDirectory: string;
	viewsDirectory: string;
	globalDataDirectory: string;
	templateEngine: ConfigOptions['server']['templateEngine'];
	staticFilesRoute: string;
	staticFilesPath: string;
	port: number;
}

/**
 * Parses the configuration file and returns the options
 * or fallback value
 * */
export function configureAppInternals(
	options: ConfigOptions
): ConfigureAppInternalsResults{
	const serverOptions = options?.server;

	const rootDirectory = options?.root ?? path.join(process.cwd(), 'src');
	const staticFilesRoute = serverOptions?.staticFilesRoute ?? '/public';
	const staticFilesPath =
		serverOptions?.staticFilesPath ?? path.join(process.cwd(), 'public');

	const viewsDirectory =
		options?.viewsDirectory ?? path.join(rootDirectory, 'views');
	const globalDataDirectory =
		options?.globalDataDirectory ?? path.join(rootDirectory, 'views');

	const templateEngine = serverOptions?.templateEngine ?? 'njk';

	const port = serverOptions?.port ?? 3000;

	return {
		rootDirectory,
		globalDataDirectory,
		viewsDirectory,
		templateEngine,
		staticFilesRoute,
		staticFilesPath,
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
				const dataFileFunctions = await compileAndRunTS(
					path.join(globalDataDirectory, dataFile)
				);
				const dataFileContents = dataFileFunctions.find(
					(func) => func.key === 'default'
				);

				/* Get the name of the file and the return value
                of the callback */
				const dataBasename = dataFile
					.replace(globalDataDirectory, '')
					.replace('.js', '')
					.replace('.ts', '');

				const data = await dataFileContents.callback();

				/* Set the value of each data file to a local global
				 * variable in the app */
				app.locals[dataBasename] = data;
			}
		})();
	}
}
