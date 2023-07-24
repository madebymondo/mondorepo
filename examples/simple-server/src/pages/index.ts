export async function createPage() {
	return {
		title: 'Prerendered Homepage',
		template: 'base.njk',
		prerender: true,
	};
}
