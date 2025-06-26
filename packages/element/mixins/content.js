'use strict'

import { isFunction, setContentKey } from '@domql/utils'
import { set } from '../set.js'

export const updateContent = function (params, options) {
  const element = this
  const ref = element.__ref

  const contentKey = ref.contentElementKey

  if (!element[contentKey]) return
  if (element[contentKey].update) element[contentKey].update(params, options)
}

export const removeContent = function (el, opts = {}) {
  const element = el || this
  const { __ref: ref } = element
  const contentElementKey = setContentKey(element, opts)

  if (opts.contentElementKey !== 'content') opts.contentElementKey = 'content'
  if (element[contentElementKey]) {
    if (element[contentElementKey].node && element.node) {
      if (element[contentElementKey].tag === 'fragment')
        element.node.innerHTML = ''
      else {
        const contentNode = element[contentElementKey].node
        if (contentNode.parentNode === element.node)
          element.node.removeChild(element[contentElementKey].node)
      }
    }

    const { __cached } = ref
    if (__cached && __cached[contentElementKey]) {
      if (__cached[contentElementKey].tag === 'fragment')
        __cached[contentElementKey].parent.node.innerHTML = ''
      else if (
        __cached[contentElementKey] &&
        isFunction(__cached[contentElementKey].remove)
      )
        __cached[contentElementKey].remove()
    }

    ref.__children.splice(ref.__children.indexOf(element[contentElementKey]), 1)

    delete element[contentElementKey]
  }
}

/**
 * Appends anything as content
 * an original one as a child
 */
export function setContent (param, element, node, opts) {
  const contentElementKey = setContentKey(element, opts)
  if (param && element) {
    if (element[contentElementKey]?.update) {
      element[contentElementKey].update({}, opts)
    } else {
      set.call(element, param, opts)
    }
  }
}

export default setContent
