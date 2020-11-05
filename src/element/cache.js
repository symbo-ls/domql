'use strict'

import { can } from '../event'
import { report } from '../utils'

import nodes from './nodes'

const cachedElements = {}

const createNode = (element) => {
  const { tag } = element
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
  let { tag, key } = element
  const tagFromKey = nodes.body.indexOf(key) > -1

  if (typeof tag !== 'string') {
    if (tagFromKey && tag === true) tag = key
    else tag = tagFromKey ? key : 'div'
  }

  element.tag = tag

  if (!can.render(element)) {
    return report('HTMLInvalidTag')
  }

  let cachedTag = cachedElements[tag]
  if (!cachedTag) cachedTag = cachedElements[tag] = createNode(element)

  const clonedNode = cachedTag.cloneNode(true)
  if (tag === 'string') clonedNode.nodeValue = element.text
  return clonedNode
}
