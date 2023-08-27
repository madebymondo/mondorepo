const locales = {
	ja: [
		{ slug: 'pages/page-one', title: 'Japanese page one' },
		{ slug: 'pages/page-two', title: 'Japanese page two' },
	],
};

export async function createPage(ctx) {
	// Matches the [page].ts
	const slug = ctx.params.page;
	const locale = ctx.params.locale;

	// Get the pages for the locale
	const pages = locales[locale];

	const pageData = pages.find((page) => page.slug === slug);

	if (!pages || !pageData) {
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
	const availableLocales = Object.keys(locales);

	let pages = [];
	for (const locale of availableLocales) {
		const pagesForLocale = locales[locale];

		for (const localizedPage of pagesForLocale) {
			pages.push({
				page: localizedPage.slug,
				locale,
			});
		}
	}

	return pages;
}
