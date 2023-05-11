'use strict'

import { isObject, exec, isFunction, isNumber, isString } from '@domql/utils'
import { METHODS_EXL, overwrite } from './utils'
import { isMethod } from '@domql/methods'

export const throughInitialExec = (element, exclude = {}) => {
  const { __ref: ref } = element
  for (const param in element) {
    if (exclude[param]) continue
    const prop = element[param]
    if (isFunction(prop) && !isMethod(param)) {
      ref.__exec[param] = prop
      element[param] = prop(element, element.state)
    }
  }
}

export const throughUpdatedExec = (element, options = { excludes: METHODS_EXL }) => {
  const { __ref: ref } = element
  const changes = {}

  for (const param in ref.__exec) {
    const prop = element[param]

    const isDefinedParam = ref.__defineCache[param]
    if (isDefinedParam) continue

    const newExec = ref.__exec[param](element, element.state)
    const execReturnsString = isString(newExec) || isNumber(newExec)
    if (prop && prop.node && execReturnsString) {
      overwrite(prop, { text: newExec }, options)
    } else if (newExec !== prop) {
      ref.__cached[param] = changes[param] = prop
      element[param] = newExec
    }
  }

  return changes
}

export const throughInitialDefine = (element) => {
  const { define, context, __ref: ref } = element

  let defineObj = {}
  const hasGlobalDefine = context && isObject(context.define)
  if (isObject(define)) defineObj = { ...define }
  if (hasGlobalDefine) defineObj = { ...defineObj, ...context.define }

  for (const param in defineObj) {
    let elementProp = element[param]

    if (isFunction(elementProp) && !isMethod(param)) {
      ref.__exec[param] = elementProp
      const execParam = elementProp = exec(elementProp, element)

      if (execParam) {
        elementProp = element[param] = execParam.parse ? execParam.parse() : execParam
        ref.__defineCache[param] = elementProp
      }
    }

    const execParam = defineObj[param](elementProp, element, element.state)
    if (execParam) element[param] = execParam
  }
  return element
}

export const throughUpdatedDefine = (element) => {
  const { context, define, __ref: ref } = element
  const changes = {}

  let obj = {}
  if (isObject(define)) obj = { ...define }
  if (isObject(context && context.define)) obj = { ...obj, ...context.define }

  for (const param in obj) {
    const execParam = ref.__exec[param]
    if (execParam) ref.__defineCache[param] = execParam(element, element.state)
    const cached = exec(ref.__defineCache[param], element)
    const newExecParam = obj[param](cached, element, element.state)
    if (newExecParam) element[param] = newExecParam
  }
  return changes
}
