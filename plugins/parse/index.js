'use strict'

import { create } from '@domql/element'
import { assignNode } from '@domql/render'

export const parse = element => {
  const virtualTree = {
    node: document.createElement('div')
  }

  if (element && element.node) assignNode(element, virtualTree)
  else create(element, virtualTree)

  return virtualTree.node.innerHTML
}
