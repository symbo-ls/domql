'use strict'

import { deepContains } from '@domql/utils'

import create from './create'
import OPTIONS from './cache/options'
import { registry } from './mixins'
import { removeContent } from './mixins/content'

export const resetElement = (params, element, options) => {
  const perf = performance.now()
  if (!options.preventRemove) removeContent(element, options)
  create(params, element, options.contentElementKey || 'content', {
    ignoreChildExtend: true,
    ...registry.defaultOptions,
    ...OPTIONS.create,
    ...options
  })

  if (element.key === 'Grid') console.log(element.key, performance.now() - perf)
}

const set = function (params, options = {}, el) {
  const element = el || this
  const { __ref: ref, content } = element
  const __contentRef = content && content.__ref
  const lazyLoad = element.props && element.props.lazyLoad

  const hasCollection = element.$collection || element.$stateCollection || element.$propsCollection
  if (options.preventContentUpdate === true && !hasCollection) return

  if (ref.__noCollectionDifference || (__contentRef && __contentRef.__cached && deepContains(params, content))) {
    if (content?.update) content.update()
    return
  }

  if (params) {
    const { childExtend } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend

    if (lazyLoad) {
      window.requestAnimationFrame(() => resetElement(params, element, options))
    } else resetElement(params, element, options)
  }

  return element
}

export default set
