const pages = [
	{
		slug: 'page-one',
		title: 'Page One',
	},
	{
		slug: 'pages/page-two',
		title: 'Prerendered Page Two',
	},
];

export async function createPage(ctx) {
	// Matches the [page].ts
	const slug = ctx.params.page;

	const pageData = pages.find((page) => page.slug === slug);

	if (!pageData) {
		return;
	}

	return {
		template: 'base.njk',
		title: pageData?.title,
		slug: pageData?.slug,
		prerender: slug === 'pages/page-two',
	};
}

// This function is only needed for SSG or if using pre-render in server mode
export async function createPaths() {
	return pages.map((pageData) => ({
		// Return the [page] param for SSG
		page: pageData.slug,
	}));
}
