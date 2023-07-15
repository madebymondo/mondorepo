declare module '@mondo/mondo' {
	/** Options that can be passed to the mondo.config.ts file */
	interface ConfigOptions {
		/** Project root directory path */
		root?: string;
		/** Port for development and production server mode */
		port?: number;
	}

	/** Object in a dynamically imported file */
	interface FileData {
		key: string;
		callback: any;
	}

	/** Response from dynamically importing a file */
	type DynamicallyImportedFile = FileData[];
}
