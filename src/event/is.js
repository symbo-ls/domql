'use strict'

export const node = (node) => {
  var { Node } = window
  return (
    typeof Node === 'object' ? node instanceof Node : node &&
      typeof node === 'object' &&
      typeof node.nodeType === 'number' &&
      typeof node.tag === 'string'
  )
}

export const element = (element) => {
  var { HTMLElement } = window
  return (
    typeof HTMLElement === 'object'
      ? element instanceof HTMLElement
      : element && typeof element === 'object' &&
        element !== null && element.nodeType === 1 &&
        typeof element.tag === 'string'
  )
}
