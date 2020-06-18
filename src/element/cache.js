'use strict'

import Evt from '../event'
import Report from '../utils/report'

import nodes from './nodes'

var cachedElements = {}

var createNode = (element) => {
  var { tag } = element
  if (tag) {
    if (tag === 'string') return document.createTextNode(element.text)
    else if (tag === 'fragment') {
      return document.createDocumentFragment()
    } else if (tag === 'svg' || tag === 'path') { // change that
      return document.createElementNS('http://www.w3.org/2000/svg', tag)
    } else return document.createElement(tag)
  } else {
    return document.createElement('div')
  }
}

export default (element) => {
  var { tag, key } = element
  var tagFromKey = nodes.body.indexOf(key) > -1

  if (typeof tag !== 'string') {
    if (tagFromKey && tag === true) tag = key
    else tag = tagFromKey ? key : 'div'
  }

  element.tag = tag

  if (!Evt.can.render(element)) {
    return Report('HTMLInvalidTag')
  }

  var cachedTag = cachedElements[tag]
  if (!cachedTag) cachedTag = cachedElements[tag] = createNode(element)

  var clonedNode = cachedTag.cloneNode(true)
  if (tag === 'string') clonedNode.nodeValue = element.text
  return clonedNode
}
