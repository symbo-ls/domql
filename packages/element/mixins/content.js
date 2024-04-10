'use strict'

import { isFunction } from '@domql/utils'
import set from '../set'

export const updateContent = function (params, options) {
  const element = this

  if (!element.content) return
  if (element.content.update) element.content.update(params, options)
}

export const removeContent = function (el) {
  const element = el || this
  const { __ref } = element

  if (element.content) {
    if (element.content.node && element.node) {
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

/**
 * Appends anything as content
 * an original one as a child
 */
export const setContent = (param, element, node, options) => {
  if (param && element) {
    if (element.content.update) {
      element.content.update({}, options)
    } else {
      set.call(element, param, options)
    }
  }
}

export default setContent
