'use strict'

import { isObject, exec, isFunction, isNumber, isString, overwrite } from '../utils'
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

export const throughUpdatedExec = (element, options) => {
  const { __exec } = element
  const changes = {}

  for (const param in __exec) {
    const prop = element[param]
    const newExec = __exec[param](element, element.state)

    // if element is string
    if (prop && prop.node && (isString(newExec) || isNumber(newExec))) {
      overwrite(prop, { text: newExec }, options)
    } else if (newExec !== prop) {
      element.__cached[param] = changes[param] = prop
      element[param] = newExec
    }
  }

  return changes
}

export const throughInitialDefine = (element) => {
  const { define, context } = element

  let obj = {}
  if (isObject(define)) obj = { ...define }
  if (context && isObject(context.define)) obj = { ...obj, ...context.define }

  for (const param in obj) {
    let prop = element[param]

    if (isFunction(prop) && !isMethod(param)) {
      element.__exec[param] = prop
      element[param] = prop = exec(prop, element)
    }

    element.__cached[param] = prop
    element[param] = obj[param](prop, element, element.state)
  }
  return element
}

export const throughUpdatedDefine = (element) => {
  const { context, define, __exec } = element
  const changes = {}

  let obj = {}
  if (isObject(define)) obj = { ...define }
  if (isObject(context && context.define)) obj = { ...obj, ...context.define }

  for (const param in obj) {
    const execParam = __exec[param]
    if (execParam) element.__cached[param] = execParam(element, element.state)
    const cached = exec(element.__cached[param], element)
    element[param] = obj[param](cached, element, element.state)
  }
  return changes
}
