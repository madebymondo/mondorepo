import { vol, fs } from 'memfs';
import { describe, it, beforeEach, jest, expect } from '@jest/globals';
import { walkSync } from '@/utils/router';

jest.mock('fs');
jest.mock('fs/promises');

const pageJSON = {
	'./index.ts': 'homepage',
	'./projects/[project].ts': 'project page',
	'./projects/index.ts': 'project homepage',
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
});
