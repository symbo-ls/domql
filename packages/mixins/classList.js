'use strict'

import { applyClassListOnNode } from '@domql/classlist'

export * from '@domql/classlist'

<<<<<<< HEAD:src/element/mixins/classList.js
export default (params, element, node) => {
  applyClassListOnNode(params, element, node)
=======
// stringifies class object
export const classify = (obj, element) => {
  let className = ''
  for (const item in obj) {
    const param = obj[item]
    if (typeof param === 'boolean' && param) className += ` ${item}`
    else if (typeof param === 'string') className += ` ${param}`
    else if (typeof param === 'function') {
      className += ` ${exec(param, element)}`
    }
  }
  return className
}

export const classList = (params, element) => {
  if (!params) return
  const { key } = element // eslint-disable-line
  if (params === true) params = element.class = { key }
  if (isString(params)) params = element.class = { default: params }
  if (isObject(params)) params = classify(params, element)
  // TODO: fails on string
  const className = params.replace(/\s+/g, ' ').trim()
  element.ref.class = className
  return className
>>>>>>> feature/v2:packages/mixins/classList.js
}
