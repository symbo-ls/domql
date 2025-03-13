'use strict'

import { deepContains, execPromise, isFunction, OPTIONS } from '@domql/utils'
import { create } from './create.js'
import { triggerEventOn, triggerEventOnUpdate } from '@domql/event'

export const setContentKey = (element, opts = {}) => {
  const { __ref: ref } = element
  const contentElementKey = opts.contentElementKey
  if (!ref.contentElementKey || contentElementKey !== ref.contentElementKey) {
    ref.contentElementKey = contentElementKey || 'content'
  }
  return ref.contentElementKey
}

export const reset = async options => {
  const element = this
  await create(element, element.parent, undefined, {
    ignoreChildExtends: true,
    ...OPTIONS.defaultOptions,
    ...OPTIONS.create,
    ...options
  })
}

export const resetContent = async (params, element, opts) => {
  const contentElementKey = setContentKey(element, opts)
  if (element[contentElementKey]?.node) removeContent(element, opts)
  const contentElem = await create(
    params,
    element,
    contentElementKey || 'content',
    {
      ignoreChildExtends: true,
      ...OPTIONS.defaultOptions,
      ...OPTIONS.create,
      ...opts
    }
  )
  if (contentElementKey !== 'content') opts.contentElementKey = 'content' // reset to default
  return contentElem
}

export const updateContent = async function (params, opts) {
  const element = this
  const contentElementKey = setContentKey(element, opts)
  if (!element[contentElementKey]) return
  if (element[contentElementKey].update) {
    await element[contentElementKey].update(params, opts)
  }
}

/**
 * Appends anything as content
 * an original one as a child
 */
export async function setContent (param, element, opts) {
  const content = await execPromise(param, element)

  if (content && element) {
    set.call(element, content, opts)
  }
}

export const removeContent = function (el, opts = {}) {
  const element = el || this

  const contentElementKey = setContentKey(element, opts)
  if (opts.contentElementKey !== 'content') {
    opts.contentElementKey = 'content'
  }

  const content = element[contentElementKey]
  if (!content) return

  // Handle fragment removal
  if (content.tag === 'fragment') {
    // Remove all child nodes if they exist
    Object.values(content.__ref.__children).forEach(key => {
      const child = content[key]
      if (child.node && child.node.parentNode) {
        child.node.parentNode.removeChild(child.node)
      }
      if (isFunction(child.remove)) {
        child.remove()
      }
    })
  } else {
    // Handle regular element removal
    if (content.node && content.node.parentNode) {
      content.node.parentNode.removeChild(content.node)
    }
    if (isFunction(content.remove)) {
      content.remove()
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
    Object.keys(params).length === Object.keys(content).length &&
    deepContains(params, content)

  if (content?.update && !childHasChanged && !childrenIsDifferentFromCache) {
    if (!options.preventBeforeUpdateListener && !options.preventListeners) {
      const beforeUpdateReturns = await triggerEventOnUpdate(
        'beforeUpdate',
        params,
        element,
        options
      )
      if (beforeUpdateReturns === false) return element
    }
    await content.update(params)
    if (!options.preventUpdateListener && !options.preventListeners) {
      await triggerEventOn('update', element, options)
    }
    return
  }

  if (!params) return element

  let { childExtends, props, tag } = params
  if (!props) props = params.props = {}

  if (tag === 'fragment') {
    if (!childExtends && element.childExtends) {
      params.childExtends = element.childExtends
      props.ignoreChildExtends = true
    }

    if (!props?.childProps && element.props?.childProps) {
      props.childProps = element.props.childProps
      props.ignoreChildProps = true
    }
  }

  if (lazyLoad) {
    window.requestAnimationFrame(async () => {
      await resetContent(params, element, options)
      // handle lazy load
      if (!options.preventUpdateListener) {
        await triggerEventOn('lazyLoad', element, options)
      }
    })
  } else {
    await resetContent(params, element, options)
  }
}

export default set
