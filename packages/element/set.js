'use strict'

import { deepContains, setContentKey } from '@domql/utils'

import create from './create'
import OPTIONS from './cache/options'
import { registry } from './mixins'
import { removeContent } from './mixins/content'
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

const set = function (params, options = {}, el) {
  const element = el || this
  const { __ref: ref } = element

  const content = setContentKey(element, options)
  const __contentRef = content && content.__ref
  const lazyLoad = element.props && element.props.lazyLoad

  if (!options.preventBeforeUpdateListener && !options.preventListeners) {
    const beforeUpdateReturns = triggerEventOnUpdate('beforeUpdate', params, element, options)
    if (beforeUpdateReturns === false) return element
  }

  const hasCollection = element.$collection || element.$stateCollection || element.$propsCollection
  if (options.preventContentUpdate === true && !hasCollection) return

  if (ref.__noCollectionDifference || (__contentRef && __contentRef.__cached && deepContains(params, content))) {
    if (content?.update) content.update()
    return
  }

  if (params) {
    const { childExtend, childProps, props } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend
    if (!childProps && element.childProps) params.childProps = element.childProps
    if (!props?.childProps && element.props?.childProps) {
      params.props.childProps = element.props.childProps
    }

    if (lazyLoad) {
      window.requestAnimationFrame(() => resetElement(params, element, options))
    } else resetElement(params, element, options)
  }

  if (!options.preventUpdateListener) triggerEventOn('update', element, options)

  return element
}

export default set
