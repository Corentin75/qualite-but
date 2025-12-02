import pino   from 'pino';
import pretty from 'pino-pretty';

export const logger = pino({ level: 'info' }, pretty({
  colorize: true
}));

/**
 * Returns an empty string if el is undefined, otherwise returns el as is.
 * 
 * @param {string | undefined} el - The string to check.
 * 
 * @returns {string}              - An empty string if el is undefined, otherwise el.
 */
export function avoidEmptyString(el:string | undefined){
  return el === undefined
    ? ""
    : el;
}

/**
 * Forces the given element to a number.
 * If el is a string, it will be parsed to an integer.
 * If el is already a number, it will be returned as is.
 * If el is of any other type, an error will be thrown.
 * 
 * @param {any} el - The element to force to a number.
 *
 * @returns {number} - The forced number.
 * @throws  {Error}    if el cannot be converted to a number.
 */
export function forceNumber(el: any): number {
  if (typeof el === 'number') return el;

  if (typeof el === 'string' && el.trim() !== '') {
    const n = Number(el);
    if (!Number.isNaN(n)) return n;
  }

  throw new Error('cannot convert to a number');
}