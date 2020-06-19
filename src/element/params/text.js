'use strict'

import { appendNode } from '../assign'
import cacheNode from '../cache'

/**
 * Creates a text node and appends into
 * an original one as a child
 */
export default (param, element) => {
  if ((element.tag) === 'string') element.node.innerText = param
  else {
    param = { tag: 'string', text: param }

    var textNode = cacheNode(param)
    appendNode(textNode, element.node)
  }
}
