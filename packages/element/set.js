'use strict'

import { deepContains } from '@domql/utils'

import create from './create'
import OPTIONS from './cache/options'
import { registry } from './mixins'
import { removeContent } from './mixins/content'

const set = function (params, options = {}, el) {
  const element = el || this
  const { __ref: ref, content } = element
  const __contentRef = content && content.__ref
  const lazyLoad = element.props && element.props.lazyLoad

  if (ref.__noCollectionDifference || (__contentRef && __contentRef.__cached && deepContains(params, content))) {
    console.log('is content equal')
    return content.update()
  }

  if (options.preventContentUpdate === true) return

  const setAsync = () => {
    removeContent(element)
    create(params, element, 'content', {
      ignoreChildExtend: true,
      ...registry.defaultOptions,
      ...OPTIONS.create,
      ...options
    })
  }

  if (params) {
    const { childExtend } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend

    if (lazyLoad) {
      window.requestAnimationFrame(setAsync)
    } else setAsync()
  }

  return element
}

export default set
