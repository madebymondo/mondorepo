import chalk from 'chalk';

/**
 * Logs a value with chalk.green
 *
 * @param message Value passed to chalk
 * @returns Green console.log message
 */
export function logGreen(message: string) {
	return console.log(chalk.green(message));
}

/**
 * Logs a value with chalk.red
 *
 * @param message Value passed to chalk
 * @returns Red console.log message
 */
export function logRed(message: string) {
	return console.log(chalk.red(message));
}
