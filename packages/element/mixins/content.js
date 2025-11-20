'use strict'

import { isFunction, setContentKey } from '@domql/utils'
import { set } from '../set.js'

export const updateContent = async function (params, options) {
  const element = this
  const ref = element.__ref

  const contentKey = ref.contentElementKey

  if (!element[contentKey]) return
  if (element[contentKey].update)
    await element[contentKey].update(params, options)
}

export const removeContent = function (el, opts = {}) {
  const element = el || this
  const { __ref: ref } = element
  // console.warn('removing content', ref.path)
  const contentElementKey = setContentKey(element, opts)

  if (opts.contentElementKey !== 'content') opts.contentElementKey = 'content'
  const contentElement = element[contentElementKey]
  if (contentElement) {
    if (contentElement.node && element.node) {
      if (contentElement.tag === 'fragment')
        element.node.innerHTML = '' // TODO: deep check to only remove `content` children and not other children
      else {
        const contentNode = contentElement.node
        if (contentNode.parentNode === element.node)
          element.node.removeChild(contentElement.node)
      }
    }

    const { __cachedContent } = ref
    if (__cachedContent) {
      if (__cachedContent.tag === 'fragment')
        __cachedContent.parent.node.innerHTML = ''
      else if (__cachedContent && isFunction(__cachedContent.remove))
        __cachedContent.remove()
      delete ref.__cachedContent
    }

    ref.__children.splice(ref.__children.indexOf(contentElementKey), 1)

    delete element[contentElementKey]
  }
}

/**
 * Appends anything as content
 * an original one as a child
 */
export async function setContent(param, element, node, opts) {
  const contentElementKey = setContentKey(element, opts)
  if (!element) this.warn('No element to set content on')

  if (param) {
    if (element[contentElementKey]?.update) {
      await element[contentElementKey].update({}, opts)
    } else {
      await set.call(element, param, opts)
    }
  } else {
    removeContent(element, opts)
  }
}

export default setContent
