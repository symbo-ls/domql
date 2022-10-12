'use strict'

import { isString } from '../utils'

export const node = (node) => {
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

