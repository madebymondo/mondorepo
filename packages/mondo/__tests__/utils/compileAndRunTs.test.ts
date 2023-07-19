import { vol, fs } from 'memfs';
import { describe, it, beforeEach, jest, expect } from '@jest/globals';
import { tsCompile } from '@/utils/compileAndRunTs.js';

jest.mock('fs');
jest.mock('fs/promises');

const pageJSON = {
	'./index.ts': `const name: string = "this is the homepage";`,
};

describe('tsCompile function utility', () => {
	beforeEach(() => {
		vol.reset();
		vol.fromJSON(pageJSON, '/pages');
	});

	it('Compiles Typescript and returns the compiled string', async () => {
		const fileContents = fs.readFileSync('/pages/index.ts', {
			encoding: 'utf-8',
		});
		const data = await tsCompile(fileContents as string);

		expect(data).toBe(`const name = "this is the homepage";`);
	});
});
