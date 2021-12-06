'use strict'

import { create, assignNode } from '@domql/element'

export const parse = (element) => {
  const virtualTree = {
    node: document.createElement('div')
  }

  if (element && element.node) assignNode(element, virtualTree)
  else create(element, virtualTree)

  return virtualTree.node.innerHTML
}
