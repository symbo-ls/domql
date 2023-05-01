'use strict'

import { window } from './globals'

/**
 * Determines whether the given object is a Node.
 * @param {*} obj - The object to be evaluated.
 * @returns {boolean} - True if the object is a Node, false otherwise.
 */
export const isNode = (obj) => {
  return (
    typeof Node === 'object'
      ? obj instanceof window.Node
      : obj && typeof obj === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string'
  ) || false
}

/**
 * Determines whether the given object is an HTML element.
 * @param {*} obj - The object to be evaluated.
 * @returns {boolean} - True if the object is an HTML element, false otherwise.
 */
export const isHtmlElement = obj => {
  return (
    typeof HTMLElement === 'object'
      ? obj instanceof window.HTMLElement // DOM2
      : obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string'
  ) || false
}
