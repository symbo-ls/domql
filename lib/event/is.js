'use strict'

var $ = require('..')

exports.is = {
  node (node) {
    return (
      typeof Node === 'object' ? node instanceof Node : node &&
        typeof node === 'object' &&
        typeof node.nodeType === 'number' &&
        typeof node.tag ==='string'
    )
  },
  element (element) {
    return (
      typeof HTMLElement === 'object' ?
        element instanceof HTMLElement :
          element && typeof element === 'object' &&
          element !== null && o.nodeType === 1 &&
          typeof o.tag ==='string'
    )
  }
}
