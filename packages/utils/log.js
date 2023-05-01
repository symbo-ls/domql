'use strict'

/**
 * Logs the provided arguments to the console if the specified boolean is true.
 * @param {boolean} condition - The boolean value that determines whether to log the arguments.
 * @param {...*} arg - The arguments to be logged to the console.
 */
export const logIf = (condition, ...arg) => {
  if (condition) arg.map(v => console.log(v))
}

/**
 * Logs the provided arguments to a console group if the specified boolean is true.
 * @param {boolean} condition - The boolean value that determines whether to log the arguments.
 * @param {string} key - The identifier for the console group.
 * @param {...*} arg - The arguments to be logged to the console.
 */
export function logGroupIf(condition, key, ...arg) {
  if (condition) {
    console.group(key);
    arg.forEach(v => console.log(v));
    console.groupEnd(key);
  }
}
