import { getSiteInternals } from '@/utils/internals.js';
import { runDevServer } from '@/lib/dev.js';
import { ConfigOptions, DefaultDynamicallyImportedFile } from '@mondo/mondo';

interface MondoConstructor {
	/** Dynamically imported mondo.config.ts file */
	configData: DefaultDynamicallyImportedFile;
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
