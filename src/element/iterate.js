'use strict'

import { isObject, exec, isFunction, isNumber, isString } from '@domql/utils'
import { overwrite } from '../utils'
import { isMethod } from '@domql/methods'

export const throughInitialExec = element => {
  const { __ref } = element
  const { __exec } = __ref
  for (const param in element) {
    const prop = element[param]
    if (isFunction(prop) && !isMethod(param)) {
      __exec[param] = prop
      element[param] = prop(element, element.state)
    }
  }
}

export const throughUpdatedExec = (element, options) => {
  const { __ref } = element
  const { __exec, __cached } = __ref
  const changes = {}

  for (const param in __exec) {
    const prop = element[param]
    const newExec = __exec[param](element, element.state)

    // if element is string
    if (prop && prop.node && (isString(newExec) || isNumber(newExec))) {
      overwrite(prop, { text: newExec }, options)
    } else if (newExec !== prop) {
      __cached[param] = changes[param] = prop
      element[param] = newExec
    }
  }

  return changes
}

export const throughInitialDefine = (element) => {
  const { define, context, __ref } = element
  const { __exec, __cached } = __ref

  let obj = {}
  if (isObject(define)) obj = { ...define }
  if (context && isObject(context.define)) obj = { ...obj, ...context.define }

  for (const param in obj) {
    let prop = element[param]

    if (isFunction(prop) && !isMethod(param)) {
      __exec[param] = prop
      element[param] = prop = exec(prop, element)
    }

    __cached[param] = prop
    element[param] = obj[param](prop, element, element.state)
  }
  return element
}

export const throughUpdatedDefine = (element) => {
  const { context, define, __ref } = element
  const { __exec, __cached } = __ref
  const changes = {}

  let obj = {}
  if (isObject(define)) obj = { ...define }
  if (isObject(context && context.define)) obj = { ...obj, ...context.define }

  for (const param in obj) {
    const execParam = __exec[param]
    if (execParam) __cached[param] = execParam(element, element.state)
    const cached = exec(__cached[param], element)
    element[param] = obj[param](cached, element, element.state)
  }
  return changes
}
