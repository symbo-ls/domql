'use strict'

import { report } from '@domql/report'
import { canRenderTag } from '@domql/event'
import { exec, isObject, isString, isValidHtmlTag } from '@domql/utils'

const cache = {}

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
  let { tag, key, props } = element
  tag = exec(tag, element)

  if (tag === true) tag = key

  if (isObject(props) && isString(props.tag)) {
    const tagExists = isValidHtmlTag(props.tag)
    if (tagExists) return props.tag
  }

  if (isString(tag)) {
    if (isValidHtmlTag(tag)) return tag
  } else {
    let keyAsTag = key.toLowerCase()
    if (keyAsTag.includes('.')) keyAsTag = keyAsTag.split('.')[0]
    if (keyAsTag.includes('_')) keyAsTag = keyAsTag.split('_')[0]
    if (isValidHtmlTag(keyAsTag)) return keyAsTag
  }

  return 'div'
}

export const cacheNode = (element) => {
  const tag = element.tag = detectTag(element)

  if (!canRenderTag(tag)) {
    return report('HTMLInvalidTag', element.tag, element)
  }

  let cachedTag = cache[tag]
  if (!cachedTag) cachedTag = cache[tag] = createHTMLNode(element)

  const clonedNode = cachedTag.cloneNode(true)
  if (tag === 'string') clonedNode.nodeValue = element.text
  return clonedNode
}
