import { describe, expect, test } from '@jest/globals';
import {
	getSiteInternals,
	DEFAULT_MONDO_CONFIGURATION,
} from '@/utils/internals';

describe('Configuration returns the correct data', () => {
	test('Return the default configuration if no configuration is exported', () => {
		const internals = getSiteInternals();
		expect(internals).toBe(DEFAULT_MONDO_CONFIGURATION);
	});
});
