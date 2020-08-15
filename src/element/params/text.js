'use strict'

import { create } from '..'

/**
 * Creates a text node and appends into
 * an original one as a child
 */
export default (param, element, node) => {
  if (element.tag === 'string') node.innerText = param
  else {
    if (element.__text) element.__text.node.nodeValue = param
    else create({ tag: 'string', text: param }, element, '__text')
  }
}
