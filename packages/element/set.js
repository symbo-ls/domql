'use strict'

import { create } from '@domql/create'

export const set = function (params, enter, leave) {
  const element = this

  // add onSetInit event

  if (params) {
    const { childExtend } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend
    create(params, element, 'content', {
      ignoreChildExtend: true
    })
  }

  // add onSet event
  return element
}
