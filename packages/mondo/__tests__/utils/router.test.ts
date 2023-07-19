import { vol, fs } from 'memfs';
import { describe, it, beforeEach, jest, expect } from '@jest/globals';
import { walkSync, resolveRoute, ResolveRouteResults } from '@/utils/router.js';

jest.mock('fs');
jest.mock('fs/promises');

const pageJSON = {
	'./index.ts': `const name = "this is the homepage";`,
	'./projects/[project].ts': 'project page',
	'./projects/index.ts': `const name = "this is the project homepage";`,
};

describe('Router performs as usual', () => {
	beforeEach(() => {
		vol.reset();
		vol.fromJSON(pageJSON, '/pages');
	});

	it('walkSync works correctly', () => {
		let walkedRoutes = {};

		for (const route of walkSync('/pages')) {
			const routeContent = fs.readFileSync(route, { encoding: 'utf-8' });

			walkedRoutes[route.replace('/pages', '.')] = routeContent;
		}

		expect(walkedRoutes).toStrictEqual(pageJSON);
	});

	it('resolveRoute should return the correct data to send to the server', async () => {
		const compiledTS: ResolveRouteResults = await resolveRoute(
			'/pages/index.ts'
		);

		expect(compiledTS.data.trim()).toBe(pageJSON['./index.ts']);
		expect(compiledTS.routeName).toBe('/pages/index');
		expect(compiledTS.isDynamicRoute).toBe(false);
		expect(compiledTS.dynamicRouteName).toBe(undefined);
	});
});
