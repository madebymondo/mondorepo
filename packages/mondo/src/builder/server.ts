import { ConfigOptions } from '@mondo/mondo';
import fs from 'fs';
import path from 'path';
import { outputFile } from '@/utils/files.js';
import { generateMergedRoutes, walkSync } from '@/utils/router.js';
import { compileAndRunTS, tsCompile } from '@/utils/compileAndRunTs.js';
import { logBlue } from '@/utils/logger.js';
import { buildStaticSite } from '@/builder/static.js';

export async function generateServerBundle(options: ConfigOptions) {
	/** Generate as compiled manifest of all route data */
	const pagesDirectory = options.pagesDirectory as string;
	const buildDirectory = options.buildDirectory as string;
	const globalDataDirectory = options.globalDataDirectory as string;

	const mergedRoutes = generateMergedRoutes(pagesDirectory);

	/** Compile config file and output to build */
	logBlue(`Compiling Mondo config file...`);
	const configPath = path.join(process.cwd(), 'mondo.config.ts');
	const compiledConfigFile = await compileAndRunTS(configPath);
	outputFile(
		`${buildDirectory}/config.json`,
		JSON.stringify(compiledConfigFile.default)
	);

	logBlue(`Building server route files...`);
	/** Convert all route files to JS and output to the build directory */
	for await (const routeFile of mergedRoutes) {
		/** Compile the route file contents to JS */
		const routeFileContents = fs.readFileSync(routeFile, {
			encoding: 'utf-8',
		});
		const compiledRoute = await tsCompile(routeFileContents);

		/**
		 * Create a route output path to the build directory with
		 * a compiled '.js' file extension
		 */
		const routePath = routeFile
			.replace(pagesDirectory, `${buildDirectory}/pages`)
			.replace('.ts', '.js');

		outputFile(routePath, compiledRoute);
	}

	const globalDataFiles = walkSync(globalDataDirectory);

	logBlue(`Building global data files...`);
	/** Convert all global data files to JS and output to the build directory */
	for await (const globalDataFile of globalDataFiles) {
		/** Compile the route file contents to JS */
		const dataFileContents = fs.readFileSync(globalDataFile, {
			encoding: 'utf-8',
		});
		const compiledDataFile = await tsCompile(dataFileContents);

		/* Create a route output path to the build directory with
		 * a compiled '.js' file extension
		 */
		const routePath = globalDataFile
			.replace(globalDataDirectory, `${buildDirectory}/data`)
			.replace('.ts', '.js');

		outputFile(routePath, compiledDataFile);
	}

	/**
	 *  Pre-prendered HTML files will be built and live in
	 * the 'build/html' directory.
	 */
	options['buildDirectory'] = path.join(
		options['buildDirectory'] as string,
		'html'
	);

	logBlue(`Building pre-rendered server routes...`);
	await buildStaticSite(options);
}
