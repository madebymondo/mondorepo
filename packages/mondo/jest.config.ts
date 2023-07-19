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
				useESM: true,
				tsconfig: {
					importHelpers: true,
				},
			},
		],
	},
	rootDir: '.',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/',
		useESM: true,
	}),
};

export default config;
