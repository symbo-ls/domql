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
