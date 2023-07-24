declare module '@madebymondo/mondo' {
	import { RequestHandler } from 'express';
	/** Options that can be passed to the mondo.config.ts file */
	interface ConfigOptions {
		/** Project root directory path. Defaults to "src" */
		root?: string;
		/** Method to use when generating site output. Defaults to 'ssg' */
		renderMode?: 'ssg' | 'server';
		/** Directory to write build output to. Defaults to 'build' */
		buildDirectory?: string;
		/** Directory where routes are stored. Defaults to "src/pages" (relative to root) */
		pagesDirectory?: string;
		/** Directory where template-related files are stored. Defaults to "src/views" (relative to root) */
		viewsDirectory?: string;
		/** Directory where global data files passed to all routes are store. Defaults to "src/data" (relative to root) */
		globalDataDirectory?: string;
		server: ServerOptions;
		/** Live-reload targets to watch for */
		watchTargets?: string[];
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
		/** Watch targtes for nodemon relative to root  */
		serverWatchTargets?: string[];
	}

	/** Object in a dynamically imported file */
	interface FileData {
		key: string;
		callback: any;
	}

	/** Response from dynamically importing a file */
	type DynamicallyImportedFile = FileData[];

	/** Dynamically imported file with a default export  */
	type DefaultDynamicallyImportedFile = { default: any };

	interface CreatePage {
		template: string;
		[key: string]: any;
	}

	interface CreatePageContext extends RequestHandler {
		[key: string]: any;
	}
}
