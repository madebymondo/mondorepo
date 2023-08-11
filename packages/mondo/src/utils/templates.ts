import nunjucks, { Environment as NunjucksEnvironment } from 'nunjucks';
import { Express } from 'express';
import { ConfigOptions, ServerOptions } from '@/types/mondo.js';

export interface RenderTemplateParams {
	/* Path to template file relative to root */
	templatePath: string;
	/* Data to pass to template */
	data: any;
}

export interface TemplateEngineParams {
	/**  Template engine (defaults to njk) */
	engine?: ServerOptions['templateEngine'];
	/**  Express app */
	app?: Express;
	/** Views directory relative to root */
	viewsDirectory: string;
	/** Custom filter from config */
	filters?: ConfigOptions['templateFilters'];
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
	 * Get the template environment for a specific template
	 *
	 * @param mode Method for how the environment should be configured. The 'build' varitaion if used for SSG.
	 * @returns Template environment
	 */
	async _getTemplateEnv(
		template: ServerOptions['templateEngine'],
		mode?: 'build'
	): Promise<NunjucksEnvironment> {
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

				/**  Add all filters to the nunjucksEnv */
				if (this.filters) {
					/** Get all available filter names */
					const filterKeys = Object.keys(this.filters);

					filterKeys.forEach((key) => {
						/** Find the filter function from the name and check if it's async */
						const filterFunction =
							this.filters && this.filters[key];
						const isAsyncFilter =
							filterFunction[Symbol.toStringTag] ===
							'AsyncFunction';

						/** Add filter to env */
						nunjucksEnv.addFilter(
							key,
							filterFunction,
							isAsyncFilter
						);
					});
				}

				return nunjucksEnv;
		}
	}

	/**
	 *
	 * @param template Path to template file in view directory
	 * @param data Data that will be passed to the template
	 * @param mode Current server mode (dev/build)
	 * @returns HTML of compiled template
	 */
	async _renderTemplate(
		template: ServerOptions['templateEngine'],
		data: any,
		mode?: 'build'
	) {
		// Fallback to nunjucks if no template engine is specified
		switch (this.engine) {
			default:
				// eslint-disable-next-line no-case-declarations
				const nunjucksEnv = await this._getTemplateEnv(template, mode);

				return nunjucksEnv.render(template ?? 'njk', data);
		}
	}
}
