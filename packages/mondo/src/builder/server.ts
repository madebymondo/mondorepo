import fs from 'fs-extra';
import path from 'path';
import { outputFile } from '@/utils/files.js';
import { generateMergedRoutes, walkSync } from '@/utils/router.js';
import { logBlue, logGreen, logYellow } from '@/utils/logger.js';
import { buildStaticSite } from '@/builder/static.js';

export async function generateServerBundle(options) {
	/** Generate as compiled manifest of all route data */
	const pagesDirectory = options.pagesDirectory as string;
	const rootDirectory = options.root as string;
	const buildDirectory = options.buildDirectory as string;
	const globalDataDirectory = options.globalDataDirectory as string;
	const passthroughDirectories = options.passthrough as string[] | undefined;

	const mergedRoutes = generateMergedRoutes(pagesDirectory);

	/** Compile config file and output to build */
	logBlue(`Compiling Mondo config file...`);

	const configPath = path.join(process.cwd(), 'mondo.config.js');

	if (!fs.existsSync(buildDirectory)) {
		fs.mkdirSync(buildDirectory);
	}

	/** Copy the configuration file to the build */
	await fs.copyFile(configPath, `${buildDirectory}/config.js`).then(() => {
		logGreen(
			`Successfully created build config file at ${buildDirectory}/config.js`
		);
	});

	/** Copy all passthrough directories to the build */
	if (passthroughDirectories) {
		logBlue(`Copying passthrough directories to build...`);
		passthroughDirectories.forEach((directory) => {
			/** Get the directory path relative to root  */
			const directoryPathRelativeToRoot = path.join(
				rootDirectory,
				directory
			);
			/** Generate the build output path and copy the directory  */
			const passedDirectoryPath = directoryPathRelativeToRoot.replace(
				rootDirectory,
				buildDirectory
			);

			fs.copySync(directoryPathRelativeToRoot, passedDirectoryPath);
		});
	} else {
		logYellow(`No passthrough directories found. Skipping copy...`);
	}

	/** Convert all route files to JS and output to the build directory */
	logBlue(`Building server route files...`);

	for await (const routeFile of mergedRoutes) {
		/** Get the contents of the route file */
		const routeFileContents = fs.readFileSync(routeFile, {
			encoding: 'utf-8',
		});

		/**
		 * Create a route output path to the build directory
		 */
		const routePath = routeFile.replace(
			pagesDirectory,
			`${buildDirectory}/pages`
		);

		outputFile(routePath, routeFileContents);
	}

	const globalDataFiles = walkSync(globalDataDirectory);

	/** Convert all global data files to JS and output to the build directory */
	logBlue(`Building global data files...`);

	for await (const globalDataFile of globalDataFiles) {
		const globalDataFileContents = fs.readFileSync(globalDataFile, {
			encoding: 'utf-8',
		});

		/* Create a route output path to the build directory  */
		const routePath = globalDataFile
			.replace(globalDataDirectory, `${buildDirectory}/data`)
			.replace('.ts', '.js');

		outputFile(routePath, globalDataFileContents);
	}

	/**
	 *  Pre-prendered HTML files will be built and live in
	 * the 'build/html' directory.
	 */

	logBlue(`Building pre-rendered server routes...`);

	options['buildDirectory'] = path.join(
		options['buildDirectory'] as string,
		'html'
	);

	await buildStaticSite(options);

	/** Copy compiled app.js file to the build folder */
	logBlue(`Generating server file...`);
	const builtServerFilePath = path.join(
		process.cwd(),
		'node_modules/@madebymondo/mondo/dist/builder/app.js'
	);
	const compiledServerContents = fs.readFileSync(builtServerFilePath, {
		encoding: 'utf-8',
	});

	const compiledServerPath = path.join(buildDirectory, 'app.js');

	outputFile(compiledServerPath, compiledServerContents);
}
