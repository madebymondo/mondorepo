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
 * Passes a value with chalk.red
 *
 * @param message Value passed to chalk
 * @returns chalk.red(message)
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

/**
 * Logs a value with chalk.blue.
 *
 * @param message Value passed to chalk
 * @returns Blue console.log message
 */
export function logBlue(message: string) {
	return console.log(chalk.blue(message));
}
