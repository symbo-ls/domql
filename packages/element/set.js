'use strict'

import { deepClone, deepContains, setContentKey } from '@domql/utils'

import { OPTIONS } from './cache/options.js'
import { create } from './create.js'
import { registry } from './mixins/index.js'
import { removeContent } from './mixins/content.js'
import { triggerEventOn, triggerEventOnUpdate } from '@domql/event'

export const resetElement = async (params, element, options) => {
  if (!options.preventRemove) removeContent(element, options)
  const { __ref: ref } = element
  const newContent = await create(
    params,
    element,
    ref.contentElementKey || 'content',
    {
      ignoreChildExtend: true,
      ...registry.defaultOptions,
      ...OPTIONS.create,
      ...options
    }
  )
  ref.__cachedContent = newContent
}

export const reset = async (options) => {
  const element = this
  await create(element, element.parent, undefined, {
    ignoreChildExtend: true,
    ...registry.defaultOptions,
    ...OPTIONS.create,
    ...options
  })
}

export const set = async function (params, options = {}, el) {
  const element = el || this
  const { __ref: ref } = element

  // console.warn(params)

  if (
    options.preventContentUpdate ||
    (options.preventUpdate && options.preventUpdate.includes?.('content'))
  )
    return

  if (options.routerContentElement && options.lastElement) {
    if (options.routerContentElement !== options.lastElement.content) return
  }

  const contentKey = setContentKey(element, options)
  const content = element[contentKey]
  const __contentRef = content && content.__ref
  const lazyLoad = element.props && element.props.lazyLoad

  const hasCollection =
    element.$collection ||
    element.$stateCollection ||
    element.$propsCollection ||
    element.props?.children
  if (options.preventContentUpdate === true && !hasCollection) return

  // console.log(deepClone(params), deepClone(content))
  // console.log(deepContains(params, content))

  if (
    options.forceUpdate &&
    !options.forceReset &&
    (ref.__noCollectionDifference ||
      (__contentRef && __contentRef.__cached && deepContains(params, content)))
  ) {
    if (!options.preventBeforeUpdateListener && !options.preventListeners) {
      const beforeUpdateReturns = await triggerEventOnUpdate(
        'beforeUpdate',
        params,
        element,
        options
      )
      if (beforeUpdateReturns === false) return element
    }
    if (content?.update) await content.update({}, options)
    if (!options.preventUpdateListener)
      await triggerEventOn('update', element, options)
    return
  }

  if (params) {
    let { childExtend, props } = params
    if (!props) props = params.props = {}
    if (!childExtend && element.childExtend) {
      params.childExtend = element.childExtend
      props.ignoreChildExtend = true
    }
    if (!props?.childProps && element.props?.childProps) {
      props.childProps = element.props.childProps
      props.ignoreChildProps = true
    }
    // TODO: check for fragment and ignore if these attrs ^

    // console.warn('setting content', ref.path)

    if (lazyLoad) {
      window.requestAnimationFrame(async () => {
        await resetElement(params, element, options)
        // handle lazy load
        if (!options.preventUpdateListener) {
          await triggerEventOn('lazyLoad', element, options)
        }
      })
    } else await resetElement(params, element, options)
  } else {
    if (!options.preventRemove) removeContent(element, options)
  }

  return element
}

export default set
