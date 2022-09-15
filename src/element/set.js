'use strict'

import create from './create'
import { isEqualDeep } from '../utils'
import { registry } from './mixins'

export const removeContentElement = function (el) {
  const element = el || this
  if (element.content) {
    if (element.content.node) {
      if (element.content.tag === 'fragment') element.node.innerHTML = ''
      else element.node.removeChild(element.content.node)
    }

    if (element.__cached && element.__cached.content) {
      if (element.__cached.content.tag === 'fragment') element.__cached.content.parent.node.innerHTML = ''
      else if (element.__cached.content) element.__cached.content?.remove()
    }

    delete element.content
  }
}

const set = function (params, options, el) {
  const element = el || this

  const isEqual = isEqualDeep(params, element.content)
  if (isEqual && element.content.__cached) return element

  removeContentElement(element)

  if (params) {
    const { childExtend } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend
    create(params, element, 'content', {
      ignoreChildExtend: true,
      ...registry.defaultOptions
    })
  }

  return element
}

export default set

