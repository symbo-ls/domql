'use strict'

import nodes from './nodes'

var cachedElements = {}

var createNode = (element) => {
  var { tag } = element
  if (tag) {
    if (tag === 'string') return document.createTextNode(element.text)
    else if (tag === 'fragment') {
      return document.createDocumentFragment()
    } else if (tag === 'svg') {
      return document.createElementNS('http://www.w3.org/2000/svg', tag)
    } else return document.createElement(tag)
  } else {
    return document.createElement('div')
  }
}

export default (element) => {
  var tag
  if (element.tag) tag = element.tag
  else {
    if (nodes.body.indexOf(element.key) > -1) tag = element.key
    element.tag = tag || 'div'
  }

  var cachedTag = cachedElements[tag]
  if (!cachedTag) cachedTag = cachedElements[tag] = createNode(element)

  var clonedNode = cachedTag.cloneNode(true)
  if (tag === 'string') clonedNode.nodeValue = element.text
  return clonedNode
}
