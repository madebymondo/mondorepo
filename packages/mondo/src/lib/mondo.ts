import { getSiteInternals } from '@/utils/internals.js';
import { runDevServer } from '@/lib/dev.js';
import { ConfigOptions, DynamicallyImportedFile } from '@mondo/mondo';

interface MondoConstructor {
	/** Dynamically imported mondo.config.ts file */
	configData: DynamicallyImportedFile;
}

export class Mondo {
	siteInternals: ConfigOptions;

	constructor(options: MondoConstructor) {
		/** Parse config file data */
		this.siteInternals = getSiteInternals(options.configData);
	}

	/**
	 * Command run with mondo dev. Initializes the
	 * dev server and environment.
	 */
	async runDev() {
		await runDevServer({
			internals: this.siteInternals,
		});
	}
}
