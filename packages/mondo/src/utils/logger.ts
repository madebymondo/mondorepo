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
	/* Don't return console.log since most times this will be run in an Error */
	return chalk.red(message);
}

/**
 * Logs a value with chalk.yellow
 *
 * @param message Value passed to chalk
 * @returns Yellow console.log message
 */
export function logYellow(message: string) {
	return console.log(chalk.yellow(message));
}
