import nunjucks, { Environment as NunjucksEnvironment } from 'nunjucks';
import { Express } from 'express';

export interface RenderTemplateParams {
	/* Path to template file relative to root */
	templatePath: string;
	/* Data to pass to template */
	data: any;
}

export interface TemplateEngineParams {
	/**  Template engine (defaults to njk) */
	engine?: string;
	/**  Express app */
	app?: Express;
	/** Views directory relative to root */
	viewsDirectory: string;
	/** Custom filter from config */
	//TODO: use a stronger type
	filters?: CallableFunction[];
}

export class TemplateEngine {
	/* Template engine (defaults to njk) */
	views: TemplateEngineParams['viewsDirectory'];
	filters?: TemplateEngineParams['filters'];
	engine?: TemplateEngineParams['engine'];
	app?: TemplateEngineParams['app'];

	constructor(options: TemplateEngineParams) {
		this.engine = options?.engine;
		this.filters = options?.filters;
		this.views = options?.viewsDirectory;
		this.app = options.app;
	}

	/**
	 *
	 * @param template Path to template file in view directory
	 * @param data Data that will be passed to the template
	 * @param mode Current server mode (dev/build)
	 * @returns HTML of compiled template
	 */
	async _renderTemplate(template: string, data: any, mode?: 'build' | 'dev') {
		// Fallback to nunjucks if no template engine is specified
		switch (this.engine) {
			default:
				// eslint-disable-next-line no-case-declarations
				let nunjucksEnv: NunjucksEnvironment = nunjucks.configure(
					this.views,
					{
						autoescape: true,
						express: this.app,
					}
				);

				/**
				 *  When building with nunjucks you don't have to pass the
				 * Express app as an option
				 */

				if (mode === 'build') {
					nunjucksEnv = nunjucks.configure(this.views);
				}

				/**  Call all filters with the nunjucksEnv */
				if (this.filters) {
					for await (const filter of this.filters) {
						await filter(nunjucksEnv);
					}
				}

				return nunjucksEnv.render(template, data);
		}
	}
}
