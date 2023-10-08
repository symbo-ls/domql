'use strict'

import { deepContains } from '@domql/utils'

import create from './create'
import OPTIONS from './cache/options'
import { registry } from './mixins'
import { removeContent } from './mixins/content'

const set = function (params, options = {}, el) {
  const element = el || this
  const __contentRef = element.content && element.content.__ref

  if (__contentRef && __contentRef.__cached && deepContains(params, element.content)) {
    console.log('is content equal')
    return element.content.update()
  }

  removeContent(element)

  if (params) {
    const { childExtend } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend
    create(params, element, 'content', {
      ignoreChildExtend: true,
      ...registry.defaultOptions,
      ...OPTIONS.create,
      ...options
    })
  }

  return element
}

export default set
