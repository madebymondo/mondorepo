import client from '../cms/client.js';

export async function createPage() {
	console.log(client);
	return {
		title: 'Prerendered Homepage',
		template: 'base.njk',
		prerender: true,
	};
}
