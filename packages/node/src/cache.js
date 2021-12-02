'use strict'

import { can } from '@domql/event'
import { exec, isString, isTagRegistered, report } from '@domql/utils'

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

const detectTag = element => {
  let { tag, key } = element
  tag = exec(tag, element)

  if (tag === true) tag = key

  if (isString(tag)) {
    const tagExists = isTagRegistered(tag) > -1
    if (tagExists) return tag
  } else {
    const isKeyATag = isTagRegistered(key) > -1
    if (isKeyATag) return key
  }

  return 'div'
}

export const cacheNode = (element) => {
  const tag = element.tag = detectTag(element)

  if (!can.render(element)) {
    return report('HTMLInvalidTag')
  }

  let cachedTag = cachedElements[tag]
  if (!cachedTag) cachedTag = cachedElements[tag] = createNode(element)

  const clonedNode = cachedTag.cloneNode(true)
  if (tag === 'string') clonedNode.nodeValue = element.text
  return clonedNode
}
