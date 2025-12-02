import { describe, expect, it, vi } from 'vitest';
import { avoidEmptyString, forceNumber } from '../src/core/utils.js';
import { addTask } from '../src/core/eventManager.js';

describe('utils', () => {
  it('should return an empty string if element is undefined', () => {
    expect(avoidEmptyString(undefined)).toBe('');
  });

  it('should return "Hello World!"', () => {
    expect(avoidEmptyString("Hello World!")).toBe("Hello World!");
  });
})

describe('forceNumber', () => {
  it('should return 5', () => {
    expect(forceNumber(5)).toBe(5);
  });

  it('should return "5"', () => {
    expect(forceNumber("5")).toBe(5);
  });

  it('should return that 5 is not equal to "coucou"', () => {
    expect(forceNumber(5)).not.toBe("coucou");
  });
});

describe('addTask', () => {
  it('Mock une fonction pour la mettre en paramettre de addTask', async () => {
    const myTask = vi.fn();
    addTask(myTask);
    await new Promise(setImmediate);
    expect(myTask).toHaveBeenCalledTimes(1);
  });
})
