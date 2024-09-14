'use strict'

import { isFunction } from '@domql/utils'
import set from '../set'

export const updateContent = function (params, options) {
  const element = this

  if (!element.content) return
  if (element.content.update) element.content.update(params, options)
}

export const removeContent = function (el, opts = {}) {
  const element = el || this
  const { __ref } = element
  const contentElementKey = opts.contentElementKey || 'content'

  if (element[contentElementKey]) {
    if (element[contentElementKey].node && element.node) {
      if (element[contentElementKey].tag === 'fragment') element.node.innerHTML = ''
      else {
        const contentNode = element[contentElementKey].node
        if (contentNode.parentNode === element.node) element.node.removeChild(element[contentElementKey].node)
      }
    }

    const { __cached } = __ref
    if (__cached && __cached[contentElementKey]) {
      if (__cached[contentElementKey].tag === 'fragment') __cached[contentElementKey].parent.node.innerHTML = ''
      else if (__cached[contentElementKey] && isFunction(__cached[contentElementKey].remove)) __cached[contentElementKey].remove()
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
