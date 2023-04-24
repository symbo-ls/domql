'use strict'

import { report } from '@domql/report'
import { canRender } from '@domql/event'
import { exec, isString, isValidHtmlTag } from '@domql/utils'
import { cache } from '@domql/cache'

export const createHTMLNode = (element) => {
  const { tag } = element
  if (tag) {
    if (tag === 'string') return document.createTextNode(element.text)
    else if (tag === 'fragment') {
      return document.createDocumentFragment()
    } else if (tag === 'svg' || tag === 'path') { // TODO: change that
      return document.createElementNS('http://www.w3.org/2000/svg', tag)
    } else return document.createElement(tag) // TODO: allow strict mode to check validity
  } else {
    return document.createElement('div')
  }
}

export const detectTag = element => {
  let { tag, key } = element
  tag = exec(tag, element)

  if (tag === true) tag = key

  if (isString(tag)) {
    const tagExists = isValidHtmlTag(tag)
    if (tagExists) return tag
  } else {
    const isKeyATag = isValidHtmlTag(key)
    if (isKeyATag) return key
  }

  return 'div'
}

export const cacheNode = (element) => {
  const tag = element.tag = detectTag(element)

  if (!canRender(element)) {
    return report('HTMLInvalidTag', element.tag, element)
  }

  let cachedTag = cache[tag]
  if (!cachedTag) cachedTag = cache[tag] = createHTMLNode(element)

  const clonedNode = cachedTag.cloneNode(true)
  if (tag === 'string') clonedNode.nodeValue = element.text
  return clonedNode
}
