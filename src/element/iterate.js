'use strict'

import { isFunction } from '../utils'
import { isMethod } from './methods'

export const applyEvents = element => {
  const { node, on } = element
  for (const param in on) {
    if (
      param === 'init' ||
      param === 'render' ||
      param === 'update'
    ) continue

    const appliedFunction = element.on[param]
    if (isFunction(appliedFunction)) {
      node.addEventListener(param, event =>
        appliedFunction(event, element, element.state),
      true)
    }
  }
}

export const throughInitialExec = element => {
  for (const param in element) {
    const prop = element[param]
    if (isFunction(prop) && !isMethod(param)) {
      element.__exec[param] = prop
      element[param] = prop(element, element.state)
    }
  }
}

export const throughUpdatedExec = element => {
  const { __exec } = element
  const changes = {}

  for (const param in __exec) {
    const prop = element[param]
    const newExec = __exec[param](element, element.state)
    if (newExec !== prop) {
      element.__cached[param] = changes[param] = prop
      element[param] = newExec
    }
  }

  return changes
}

export const throughInitialDefine = element => {
  const { define } = element
  for (const param in define) {
    const prop = element[param]
    element.__cached[param] = prop
    element[param] = define[param](prop, element, element.state)
  }
  return element
}

export const throughUpdatedDefine = element => {
  const { define } = element
  const changes = {}
  for (const param in define) {
    const prop = element[param]
    element[param] = define[param](prop, element, element.state)
  }
  return changes
}
