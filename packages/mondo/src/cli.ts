#!/usr/bin/env node
import 'dotenv/config';
import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { Command } from 'commander';
import { Mondo } from '@/lib/mondo.js';
import { logGreen } from '@/utils/logger.js';
import { compileAndRunTS } from './core.js';

const SITE_ROOT = process.cwd();

/** Parse and compile the data from the mondo.config.ts file  */
const configPath = path.join(SITE_ROOT, 'mondo.config.ts');
const CONFIG_FILE_DATA = await compileAndRunTS(configPath);

/** Initialize a new Mondo site */
const SITE = new Mondo({ configData: CONFIG_FILE_DATA });

/** CLI Initialization */
const program = new Command();

program
	.command('dev')
	.description('Starts development server for the Mondo site')
	.action(async () => {
		logGreen('Starting development server...');
		await SITE.runDev();
	});

program.parse();
