'use strict'

import { isEqualDeep } from '@domql/utils'
import { removeContentElement } from './remove'

import create from './create'
import { registry } from './mixins'
import OPTIONS from './options'

const set = function (params, options = {}, el) {
  const element = el || this
  const __contentRef = element.content && element.content.__ref

  const isEqual = isEqualDeep(params, element.content)
  // console.error(params)
  if (isEqual && __contentRef && __contentRef.__cached) return element
  removeContentElement(element)

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
