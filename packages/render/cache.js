'use strict'

import { report } from '@domql/report'
import { canRenderTag } from '@domql/event'
import { exec, isObject, isString, isValidHtmlTag, document } from '@domql/utils'

export const createHTMLNode = (element) => {
  const { tag, context } = element
  const doc = context.document || document
  if (tag) {
    if (tag === 'string') return doc.createTextNode(element.text)
    else if (tag === 'fragment') {
      return doc.createDocumentFragment()
    } else if (tag === 'svg' || tag === 'path') { // TODO: change that
      return doc.createElementNS('http://www.w3.org/2000/svg', tag)
    } else return doc.createElement(tag) // TODO: allow strict mode to check validity
  } else {
    return doc.createElement('div')
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
  const { context } = element
  const win = context.window || window
  const tag = element.tag = detectTag(element)

  if (!canRenderTag(tag)) {
    return report('HTMLInvalidTag', element.tag, element)
  }

  if (!win.nodeCaches) win.nodeCaches = {}
  let cachedTag = win.nodeCaches[tag]
  if (!cachedTag) cachedTag = win.nodeCaches[tag] = createHTMLNode(element)

  const clonedNode = cachedTag.cloneNode(true)
  if (tag === 'string') clonedNode.nodeValue = element.text
  return clonedNode
}
