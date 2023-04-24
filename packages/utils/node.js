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
  /** @url https://github.com/jimbrittain/isHTMLElement */
  let hasHTMLElement = false
  try {
    if (window.HTMLElement !== undefined) { hasHTMLElement = true }
  } catch (e1) {}
  if (obj !== null && obj !== undefined) {
    if (hasHTMLElement && typeof obj === 'object') {
      return ((obj instanceof window.HTMLElement))
    } else {
      try {
        if ('nodeType' in obj) {
          return ((obj.nodeType === 1))
        } else if ('tagName' in obj) {
          return (obj.tagName !== null)
        } else { return ('canHaveHTML' in obj) }
      } catch (e2) {
        try {
          if (obj.nodeType) {
            return ((obj.nodeType === 1))
          } else if (obj.tagName) {
            return (obj.tagName !== null)
          } else { return !!(obj.canHaveHTML) }
        } catch (e3) {}
        return false
      }
    }
  } else {
    if ('IMDebugger' in window) {
      (new window.IMDebugger()).pass('isHTMLElement must be supplied something.')
    } else {
      console.log('isHTMLElement must be supplied something.')
    }
    return false
  }
}
