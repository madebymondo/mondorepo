import { vol, fs } from 'memfs';
import { describe, it, beforeEach, jest, expect } from '@jest/globals';
import { walkSync, resolveRoute, ResolveRouteResults } from '@/utils/router.js';

jest.mock('fs');
jest.mock('fs/promises');

const pageJSON = {
	'./index.ts': `const name = "this is the homepage";`,
	'./[locale]/demos/[demo].ts': `const name = "this is a localized demo page";`,
	'./projects/[project].ts':
		'const name = "this is a dynamic project route";',
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

	it('resolveRoute should return the correct data for non-dynamic routes', async () => {
		const compiledTS: ResolveRouteResults = await resolveRoute({
			routeFile: '/pages/index.ts',
			pagesDirectory: '/pages',
		});

		expect(compiledTS.data.trim()).toBe(pageJSON['./index.ts']);
		expect(compiledTS.routeName).toBe('/pages/index');
		expect(compiledTS.isDynamicRoute).toBe(false);
		expect(compiledTS.dynamicRouteParams).toBe(undefined);
	});

	it('resolveRoute should return the correct data for dynamic routes', async () => {
		const compiledTS: ResolveRouteResults = await resolveRoute({
			routeFile: '/pages/projects/[project].ts',
			pagesDirectory: '/pages',
		});

		expect(compiledTS.data.trim()).toBe(
			pageJSON['./projects/[project].ts']
		);
		expect(compiledTS.routeName).toBe(undefined);
		expect(compiledTS.isDynamicRoute).toBe(true);
		expect(compiledTS.dynamicRouteParams).toStrictEqual(['project']);
	});

	it('resolveRoute should return the correct data for nested dynamic routes', async () => {
		const compiledTS: ResolveRouteResults = await resolveRoute({
			routeFile: '/pages/[locale]/demos/[demo].ts',
			pagesDirectory: '/pages',
		});

		expect(compiledTS.data.trim()).toBe(
			pageJSON['./[locale]/demos/[demo].ts']
		);
		expect(compiledTS.routeName).toBe(undefined);
		expect(compiledTS.isDynamicRoute).toBe(true);
		expect(compiledTS.dynamicRouteParams).toStrictEqual(['locale', 'demo']);
	});
});
