import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest/presets/default-esm', // or other ESM presets
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+\\.{ts|tsx}?$': [
			'ts-jest',
			{
				tsconfig: {
					importHelpers: true,
				},
			},
		],
	},
	rootDir: '.',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/',
	}),
};

export default config;
