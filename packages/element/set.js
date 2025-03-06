'use strict'

import { deepContains, execPromise, isFunction, OPTIONS } from '@domql/utils'
import { create } from './create.js'
import { triggerEventOn, triggerEventOnUpdate } from '@domql/event'

export const reset = async options => {
  const element = this
  await create(element, element.parent, undefined, {
    ignoreChildExtends: true,
    ...OPTIONS.defaultOptions,
    ...OPTIONS.create,
    ...options
  })
}

export const resetContent = async (params, element, options) => {
  if (!options.preventRemove) removeContent(element, options)
  const { __ref: ref } = element
  await create(params, element, ref.contentElementKey || 'content', {
    ignoreChildExtends: true,
    ...OPTIONS.defaultOptions,
    ...OPTIONS.create,
    ...options
  })
}

export const updateContent = async function (params, options) {
  const element = this
  const ref = element.__ref

  const contentKey = ref.contentElementKey

  if (!element[contentKey]) return
  if (element[contentKey].update) {
    await element[contentKey].update(params, options)
  }
}

/**
 * Appends anything as content
 * an original one as a child
 */
export async function setContent (param, element, opts) {
  const contentElementKey = setContentKey(element, opts)
  const content = await execPromise(param, element)

  if (content && element) {
    if (element[contentElementKey].update) {
      await element[contentElementKey].update({}, opts)
    } else {
      await set.call(element, content, opts)
    }
  }
}

export const setContentKey = (el, opts = {}) => {
  const { __ref: ref } = el
  const contentElementKey = opts.contentElementKey
  if (
    (contentElementKey !== 'content' &&
      contentElementKey !== ref.contentElementKey) ||
    !ref.contentElementKey
  ) {
    ref.contentElementKey = contentElementKey || 'content'
  } else ref.contentElementKey = 'content'
  if (contentElementKey !== 'content') opts.contentElementKey = 'content'
  return ref.contentElementKey
}

export const removeContent = function (el, opts = {}) {
  const element = el || this
  const { __ref: ref } = element

  const contentElementKey = setContentKey(element, opts)
  if (opts.contentElementKey !== 'content') {
    opts.contentElementKey = 'content'
  }

  const content = element[contentElementKey]
  if (!content) return

  const contentNode = content.node
  if (contentNode && element.node) {
    if (content.tag === 'fragment') {
      content.__ref.__children.forEach(element => {
        element.remove()
      })
      // element.node.innerHTML = ''
    } else if (contentNode.parentNode === element.node) {
      element.node.removeChild(contentNode)
    }
  }

  const { __cached } = ref
  if (__cached && __cached[contentElementKey]) {
    const cachedContent = __cached[contentElementKey]
    if (cachedContent.tag === 'fragment') {
      cachedContent.__ref?.__children?.forEach(element => {
        element.remove()
      })
    } else if (cachedContent && isFunction(cachedContent.remove)) {
      cachedContent.remove()
    }
  }

  delete element[contentElementKey]
}

export const set = async function (params, options = {}, el) {
  const element = el || this
  const { __ref: ref } = element

  const contentElementKey = setContentKey(element, options)
  const content = element[contentElementKey]
  const __contentRef = content && content.__ref
  const lazyLoad = element.props && element.props.lazyLoad

  const hasChildren = element.children
  if (options.preventContentUpdate === true && !hasChildren) return

  const childHasChanged = !ref.__noChildrenDifference
  const childrenIsDifferentFromCache =
    childHasChanged &&
    __contentRef &&
    __contentRef.__cached &&
    deepContains(params, content)

  if (content?.update && (childHasChanged || childrenIsDifferentFromCache)) {
    if (!options.preventBeforeUpdateListener && !options.preventListeners) {
      const beforeUpdateReturns = await triggerEventOnUpdate(
        'beforeUpdate',
        params,
        element,
        options
      )
      if (beforeUpdateReturns === false) return element
    }
    await content.update()
    if (!options.preventUpdateListener && !options.preventListeners) {
      await triggerEventOn('update', element, options)
    }
    return
  }

  if (!params) return element

  let { childExtends, props } = params
  if (!props) props = params.props = {}

  if (!childExtends && element.childExtends) {
    params.childExtends = element.childExtends
    props.ignoreChildExtends = true
  }

  if (!props?.childProps && element.props?.childProps) {
    props.childProps = element.props.childProps
    props.ignoreChildProps = true
  }

  if (lazyLoad) {
    window.requestAnimationFrame(async () => {
      await resetContent(params, element, options)
      // handle lazy load
      if (!options.preventUpdateListener) {
        await triggerEventOn('lazyLoad', element, options)
      }
    })
  } else await resetContent(params, element, options)

  return element
}

export default set
