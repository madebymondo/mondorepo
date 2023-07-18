import { describe, expect, test } from '@jest/globals';
import { ConfigOptions, DynamicallyImportedFile } from '@mondo/mondo';
import {
	getSiteInternals,
	DEFAULT_MONDO_CONFIGURATION,
} from '@/utils/internals';

const MOCK_CONFIGURATION_DATA: DynamicallyImportedFile = [
	{
		key: 'default',
		callback: {
			root: 'project-root',
			port: 8080,
		} as ConfigOptions,
	},
];

describe('Configuration should parsed correctly', () => {
	test('Return the default configuration if no configuration is exported', () => {
		const internals = getSiteInternals();
		expect(internals).toBe(DEFAULT_MONDO_CONFIGURATION);
	});

	test(`Configuration should update the 'port' if it's set in the config`, () => {
		const internals = getSiteInternals(MOCK_CONFIGURATION_DATA);
		expect(internals.port).toBe(8080);
	});

	test(`Configuration should update the 'root' if it's set in the config`, () => {
		const internals = getSiteInternals(MOCK_CONFIGURATION_DATA);
		expect(internals.root).toBe('project-root');
	});
});
