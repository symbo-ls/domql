'use strict'

import { window } from '@domql/globals'

export const isNode = (obj) => {
  return (
    typeof Node === 'object'
      ? obj instanceof window.Node
      : obj && typeof obj === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string'
  )
}

// Returns true if it is a DOM element
export const isHtmlElement = obj => {
  return (
    typeof HTMLElement === 'object'
      ? obj instanceof window.HTMLElement // DOM2
      : obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string'
  )
}
