import { describe, expect, it } from '@jest/globals';
import { ConfigOptions, DefaultDynamicallyImportedFile } from '@mondo/mondo';
import {
	getSiteInternals,
	DEFAULT_MONDO_CONFIGURATION,
} from '@/utils/internals.js';

const MOCK_CONFIGURATION_DATA: DefaultDynamicallyImportedFile = {
	default: {
		root: 'project-root',
		server: {
			port: 8080,
		},
	} as ConfigOptions,
};

describe('Configuration should parsed correctly', () => {
	it('Return the default configuration if no configuration is exported', () => {
		const internals = getSiteInternals();
		expect(internals).toBe(DEFAULT_MONDO_CONFIGURATION);
	});

	it(`Configuration should update the 'port' if it's set in the config`, () => {
		const internals = getSiteInternals(MOCK_CONFIGURATION_DATA);
		expect(internals.server.port).toBe(8080);
	});

	it(`Configuration should update the 'root' if it's set in the config`, () => {
		const internals = getSiteInternals(MOCK_CONFIGURATION_DATA);
		expect(internals.root).toBe('project-root');
	});
});
