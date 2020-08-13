'use strict'

import { assign, remove, cache } from '..'
import create from '../create'

console.log(assign)

/**
 * Creates a text node and appends into
 * an original one as a child
 */
export default (param, element) => {
  // var node = cache(param)
  // console.log(param, node)

  if (element.tag === 'string') element.node.innerText = param
  else {
    if (element.__text) element.__text.node.nodeValue = param
    else {
      create({ tag: 'string', text: param }, element, '__text')
    }

    // var textNode = cache(param)
    // param.node = textNode
    // assign.appendNode(textNode, element.node)
  }
}
