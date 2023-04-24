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
