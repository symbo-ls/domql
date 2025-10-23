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
  if (element[contentElementKey]) {
    if (element[contentElementKey].node && element.node) {
      if (element[contentElementKey].tag === 'fragment')
        element.node.innerHTML = '' // TODO: deep check to only remove `content` children and not other children
      else {
        const contentNode = element[contentElementKey].node
        if (contentNode.parentNode === element.node)
          element.node.removeChild(element[contentElementKey].node)
      }
    }

    const { __cached } = ref
    if (__cached && __cached[contentElementKey]) {
      const cachedContent = __cached[contentElementKey]
      if (cachedContent.tag === 'fragment')
        cachedContent.parent.node.innerHTML = ''
      else if (cachedContent && isFunction(cachedContent.remove))
        cachedContent.remove()
      delete __cached[contentElementKey]
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
  if (param && element) {
    if (element[contentElementKey]?.update) {
      await element[contentElementKey].update({}, opts)
    } else {
      await set.call(element, param, opts)
    }
  }
}

export default setContent
