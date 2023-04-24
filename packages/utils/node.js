'use strict'

import { window } from '@domql/globals'

export const isNode = (node) => {
  const { Node } = window
  return (
    typeof Node === 'function'
      ? node instanceof Node
      : node &&
        typeof node === 'object' &&
        typeof node.nodeType === 'number' &&
        typeof node.tag === 'string'
  )
}

export const isHtmlElement = obj => {
  return (
    typeof window.HTMLElement === 'object'
      ? obj instanceof window.HTMLElement // DOM2
      : obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string'
  )
}
