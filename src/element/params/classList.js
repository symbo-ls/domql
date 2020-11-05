'use strict'

import { exec } from '../../utils'

// stringifies class object
const classify = (obj, element) => {
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

const classList = (params, element, node) => {
  const { key } = element
  if (typeof params === 'string') element.class = { default: params }
  if (params === true) params = element.class = { key }
  const className = classify(element.class, element)
  const trimmed = className.replace(/\s+/g, ' ').trim()
  node.classList = trimmed
  return element
}

export default classList
