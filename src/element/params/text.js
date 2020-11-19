'use strict'

import { create } from '..'
import { exec } from '../../utils'

/**
 * Creates a text node and appends into
 * an original one as a child
 */
export default (param, element, node) => {
  const prop = exec(param, element)
  if (element.tag === 'string') node.innerText = prop
  else {
    if (element.__text) {
      element.__text.text = prop
      element.__text.node.nodeValue = prop
    } else create({ tag: 'string', text: prop }, element, '__text')
  }
}
