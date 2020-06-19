'use strict'

import create from './create'
import { assignNode } from './assign'

var parse = (element) => {
  var virtualTree = {
    node: document.createElement('div')
  }

  if (element && element.node) assignNode(element, virtualTree)
  else create(element, virtualTree)

  return virtualTree.node.innerHTML
}

export default parse
