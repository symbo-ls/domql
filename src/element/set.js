'use strict'

import { isEqualDeep, isFunction } from '@domql/utils'
import create from './create'
import { registry } from './mixins'
import OPTIONS from './options'

export const removeContentElement = function (el) {
  const element = el || this
  const { __ref } = element

  if (element.content) {
    if (element.content.node) {
      if (element.content.tag === 'fragment') element.node.innerHTML = ''
      else element.node.removeChild(element.content.node)
    }

    const { __cached } = __ref
    if (__cached && __cached.content) {
      if (__cached.content.tag === 'fragment') __cached.content.parent.node.innerHTML = ''
      else if (__cached.content && isFunction(__cached.content.remove)) __cached.content.remove()
    }

    delete element.content
  }
}

const set = function (params, options = {}, el) {
  const element = el || this
  const __contentRef = element.content && element.content.__ref

  const isEqual = isEqualDeep(params, element.content)
  // console.error(params)
  if (isEqual && __contentRef && __contentRef.__cached) return element
  removeContentElement(element)

  if (params) {
    const { childExtend } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend
    create(params, element, 'content', {
      ignoreChildExtend: true,
      ...registry.defaultOptions,
      ...OPTIONS.create,
      ...options
    })
  }

  return element
}

export default set
