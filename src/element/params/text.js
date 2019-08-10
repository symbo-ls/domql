'use strict'

import method from '../method'

import cacheNode from '../cacheNode'

/**
 * Creates a text node and appends into
 * an original one as a child
 */
export default (param, element) => {
  JSON.stringify(param)
  if ((element.tag) === 'string') element.node.innerText = param
  else {
    // console.log(param)
    param = {
      tag: 'string',
      text: param
    }
    var textNode = cacheNode(param)
    method.appendNode(textNode, element.node)
  }
}
