const pages = [
	{
		slug: 'page-one',
		title: 'Page One',
	},
	{
		slug: 'pages/page-two',
		title: 'Page Two',
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
	};
}

// This function is only needed for SSG
export async function createPaths() {
	return pages.map((pageData) => ({
		// Return the [page] param for SSG
		page: pageData.slug,
	}));
}
