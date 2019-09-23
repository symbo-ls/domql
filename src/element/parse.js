'use strict'

import create from './create'
import method from './method'

var parse = (element) => {
  var virtualTree = {
    node: document.createElement('div')
  }

  if (element && element.node)
    method.assignNode(element, virtualTree)
  else create(element, virtualTree)

  return virtualTree.node.innerHTML
}

export default parse
