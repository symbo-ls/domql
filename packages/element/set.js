'use strict'

import { deepContains, setContentKey } from '@domql/utils'

import { OPTIONS } from './cache/options.js'
import { create } from './create.js'
import { registry } from './mixins/index.js'
import { removeContent } from './mixins/content.js'
import { triggerEventOn, triggerEventOnUpdate } from '@domql/event'

export const resetElement = (params, element, options) => {
  if (!options.preventRemove) removeContent(element, options)
  const { __ref: ref } = element
  create(params, element, ref.contentElementKey || 'content', {
    ignoreChildExtend: true,
    ...registry.defaultOptions,
    ...OPTIONS.create,
    ...options
  })
}

export const reset = (options) => {
  const element = this
  create(element, element.parent, undefined, {
    ignoreChildExtend: true,
    ...registry.defaultOptions,
    ...OPTIONS.create,
    ...options
  })
}

export const set = function (params, options = {}, el) {
  const element = el || this
  const { __ref: ref } = element

  const content = setContentKey(element, options)
  const __contentRef = content && content.__ref
  const lazyLoad = element.props && element.props.lazyLoad

  const hasCollection = element.$collection || element.$stateCollection || element.$propsCollection
  if (options.preventContentUpdate === true && !hasCollection) return

  if (ref.__noCollectionDifference || (__contentRef && __contentRef.__cached && deepContains(params, content))) {
    if (!options.preventBeforeUpdateListener && !options.preventListeners) {
      const beforeUpdateReturns = triggerEventOnUpdate('beforeUpdate', params, element, options)
      if (beforeUpdateReturns === false) return element
    }
    if (content?.update) content.update()
    if (!options.preventUpdateListener) triggerEventOn('update', element, options)
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

    if (lazyLoad) {
      window.requestAnimationFrame(() => {
        resetElement(params, element, options)
        // handle lazy load
        if (!options.preventUpdateListener) {
          triggerEventOn('lazyLoad', element, options)
        }
      })
    } else resetElement(params, element, options)
  }

  return element
}

export default set
