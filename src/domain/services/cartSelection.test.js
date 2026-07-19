import { describe, it, expect } from 'vitest';
import { getDefaultCode, isValidSelection } from './cartSelection.js';

describe('getDefaultCode', () => {
  it('picks the first option as default', () => {
    expect(
      getDefaultCode([
        { code: 2000, name: '16 GB' },
        { code: 2001, name: '32 GB' },
      ]),
    ).toBe(2000);
  });

  it('works with a single option', () => {
    expect(getDefaultCode([{ code: 1000, name: 'Black' }])).toBe(1000);
  });

  it('returns null when there are no options', () => {
    expect(getDefaultCode([])).toBeNull();
    expect(getDefaultCode(undefined)).toBeNull();
  });
});

describe('isValidSelection', () => {
  it('accepts numeric codes', () => {
    expect(isValidSelection({ colorCode: 1000, storageCode: 2000 })).toBe(true);
    expect(isValidSelection({ colorCode: 0, storageCode: 0 })).toBe(true);
  });

  it('rejects missing or non-numeric codes', () => {
    expect(isValidSelection({ colorCode: null, storageCode: 2000 })).toBe(false);
    expect(isValidSelection({ colorCode: 1000 })).toBe(false);
    expect(isValidSelection({})).toBe(false);
    expect(isValidSelection()).toBe(false);
  });
});
