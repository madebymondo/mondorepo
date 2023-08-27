const pages = [
	{
		slug: 'page-one',
		title: 'loclized Page One',
	},
	{
		slug: 'pages/page-two',
		title: 'Prerendered Page Two',
	},
];

export async function createPage(ctx) {
	// Matches the [page].js
	const slug = ctx.params.page;
	const locale = ctx.params.locale;

	const pageData = pages.find((page) => page.slug === slug);

	if (!pageData) {
		return;
	}

	return {
		template: 'base.njk',
		title: pageData?.title,
		slug: pageData?.slug,
		prerender: pageData?.slug === 'pages/page-two',
		locale,
	};
}

// This function is only needed for SSG or if using pre-render in server mode
export async function createPaths() {
	/** All available locales per page  */
	const locales = ['ja', 'en-ca'];

	/** Generate every route for each locale  */
	const localesPerPage = locales.map((locale) => {
		return pages.map((pageData) => {
			return {
				page: pageData.slug,
				locale,
			};
		});
	});

	/** Merge all the localized data into one array  */
	const paths = localesPerPage.flat(1);

	return paths;
}
