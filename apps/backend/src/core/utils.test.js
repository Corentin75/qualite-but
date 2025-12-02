import { describe, expect, it } from 'vitest';

import { avoidEmptyString, forceNumber } from './utils.js';


describe('utils', () => {

  it('should return an empty string if element is undefined', () => {
    expect(avoidEmptyString(undefined)).toBe('');
  });

  it('should return element as is if it is not undefined', () => {
    expect(avoidEmptyString('hello')).toBe('hello');
  });

  it('should force an element to a number', () => {
    expect(forceNumber('123')).toBe(123);
    expect(forceNumber(456)).toBe(456);
    expect(() => forceNumber('abc')).toThrowError('cannot convert to a number');
    expect(() => forceNumber('')).toThrowError('cannot convert to a number');
    expect(() => forceNumber({})).toThrowError('cannot convert to a number');
  });
});
