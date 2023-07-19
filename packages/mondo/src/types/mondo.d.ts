declare module '@mondo/mondo' {
	/** Options that can be passed to the mondo.config.ts file */
	interface ConfigOptions {
		/** Project root directory path. Defaults to "src" */
		root?: string;
		/** Directory where routes are stored. Defaults to "src/pages" (relative to root) */
		pagesDirectory?: string;
		/** Directory where template-related files are stored. Defaults to "src/views" (relative to root) */
		viewsDirectory?: string;
		/** Directory where global data files passed to all routes are store. Defaults to "src/data" (relative to root) */
		globalDataDirectory?: string;
		server: ServerOptions;
	}

	/** Configuration options passed to the server */
	interface ServerOptions {
		/** Template engine to use */
		templateEngine: 'njk';
		/** Directory to serve static files and assets from. Defaults to "public" */
		staticFilesPath?: string;
		/** Route that serves the static files. Defaults to "/public" */
		staticFilesRoute?: string;
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
