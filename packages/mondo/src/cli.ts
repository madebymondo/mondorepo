#!/usr/bin/env node
import 'dotenv/config';
import path from 'path';
import { exec } from 'child_process';
import { Command } from 'commander';
import { logGreen, logBlue } from '@/utils/logger.js';
import bs from 'browser-sync';
import { getSiteInternals } from '@/utils/internals.js';
import { buildStaticSite } from '@/builder/static.js';
import { generateServerBundle } from './builder/server.js';

const SITE_ROOT = process.cwd();

/** Parse and compile the data from the mondo.config.ts file  */
const configPath = path.join(SITE_ROOT, 'mondo.config.js');
const importedConfigFile = await import(configPath);
const CONFIG_FILE_DATA = getSiteInternals(importedConfigFile);

const { server, watchTargets, root, renderMode } = CONFIG_FILE_DATA;

/** CLI Initialization */
const program = new Command();

program
	.command('dev')
	.description('Starts development server for the Mondo site')
	.action(async () => {
		logGreen('Starting development server...');

		/* Run the development server file */
		const devSeverPath = `${path.join(
			process.cwd(),
			'/node_modules/@madebymondo/mondo/dist/dev/app.js'
		)}`;

		/* Live reload configuration */
		const nodemonWatchTargets = server?.serverWatchTargets
			? server?.serverWatchTargets.join(',')
			: root;

		const serverProcess = exec(
			`npx nodemon --watch ${nodemonWatchTargets} -e ts,tsx,js,jsx,css,scss,njk,yaml,json ${devSeverPath}`
		);

		/**
		 * Initialis browser-sync for live reloading
		 */
		bs.init({
			proxy: `http://localhost:${server?.port ?? 3000}`,
			port: server?.port ? server.port + 1 : 3001,
			open: false,
			notify: true,
			watchOptions: {
				ignoreInitial: true,
			},
			files: watchTargets
				? watchTargets
				: [
						'**/*.js',
						'**/*.ts',
						'**/*.njk',
						'**/*.scss',
						'**/*.css',
						'**/*.yaml',
						'**/*.json',
				  ],
			logSnippet: false,
		});

		/**
		 * Log server processes fon updates
		 */
		serverProcess.stdout?.on('data', (data) => {
			logBlue(`[Server Process]: ${data.toString()}`);
		});

		serverProcess.stderr?.on('data', (data) => {
			logBlue(`[Server Error]: ${data.toString()}`);
		});

		serverProcess.on('exit', (code) => {
			logBlue(`[Server Exit]: ${code?.toString()}`);
		});
	});

program
	.command('build')
	.description('Generates Mondo site output')
	.action(async () => {
		/** Handle site building for different render modes  */
		switch (renderMode) {
			case 'server':
				logBlue(
					`The renderMode has been set to 'server'. Generating server build...`
				);

				await generateServerBundle(CONFIG_FILE_DATA);
				break;
			default:
				logBlue(
					`The renderMode has been set to 'ssg'. Generating the static build...`
				);
				buildStaticSite(CONFIG_FILE_DATA);
		}
	});

program
	.command('start')
	.description('Start Mondo production server')
	.action(() => {
		const serverProcess = exec('node build/app.js');
		/**
		 * Log server processes fon updates
		 */
		serverProcess.stdout?.on('data', (data) => {
			logBlue(`[Server Process]: ${data.toString()}`);
		});

		serverProcess.stderr?.on('data', (data) => {
			logBlue(`[Server Error]: ${data.toString()}`);
		});

		serverProcess.on('exit', (code) => {
			logBlue(`[Server Exit]: ${code?.toString()}`);
		});
	});

program.parse();
