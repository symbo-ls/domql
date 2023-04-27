'use strict'

import { assignNode } from '@domql/render'
import create from './create'

const parse = (element) => {
  const virtualTree = {
    node: document.createElement('div')
  }

  if (element && element.node) assignNode(element, virtualTree)
  else create(element, virtualTree)

  return virtualTree.node.innerHTML
}

export default parse
