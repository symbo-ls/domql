'use strict'

import {
  isObject,
  exec,
  isFunction,
  isNumber,
  isString,
  checkIfKeyIsComponent,
  extendizeByKey,
  isVariant
} from '@domql/utils'

import { METHODS_EXL, overwrite } from './utils/index.js'
import { isMethod, warn } from './methods/index.js'

export const throughInitialExec = async (element, exclude = {}) => {
  const { __ref: ref } = element
  for (const param in element) {
    if (exclude[param]) continue
    const prop = element[param]
    if (isFunction(prop) && !isMethod(param, element) && !isVariant(param)) {
      ref.__exec[param] = prop
      element[param] = await prop(element, element.state, element.context)
      // if (isComponent)
    }
  }
}

export const throughUpdatedExec = async (
  element,
  options = { excludes: METHODS_EXL }
) => {
  const { __ref: ref } = element
  const changes = {}

  for (const param in ref.__exec) {
    const prop = element[param]

    const isDefinedParam = ref.__defineCache[param]
    if (isDefinedParam) continue

    const newExec = await ref.__exec[param](
      element,
      element.state,
      element.context
    )
    const execReturnsString = isString(newExec) || isNumber(newExec)
    // if (prop && prop.node && execReturnsString) {
    if (prop && prop.node && execReturnsString) {
      overwrite(prop, { text: newExec }, options)
    } else if (newExec !== prop) {
      if (checkIfKeyIsComponent(param)) {
        const { extend, ...newElem } = extendizeByKey(newExec, element, param)
        overwrite(prop, newElem, options)
        // } else {
        //   overwrite(prop, newExec, options)
      } else {
        ref.__cached[param] = changes[param] = prop
        element[param] = newExec
      }
    }
  }

  return changes
}

export const throughExecProps = (element, opts) => {
  const { __ref: ref } = element
  const { props } = element
  for (const k in props) {
    const isDefine =
      k.startsWith('is') || k.startsWith('has') || k.startsWith('use')
    if (!ref.__execProps)
      return warn.call(element, 'Element was not initiated to execute props')
    const cachedExecProp = ref.__execProps[k]
    if (isFunction(cachedExecProp)) {
      props[k] = exec(
        cachedExecProp,
        element,
        element.state,
        element.context,
        opts
      )
    } else if (isDefine && isFunction(props[k])) {
      ref.__execProps[k] = props[k]
      props[k] = exec(props[k], element, element.state, element.context, opts)
    }
  }
}

export const throughInitialDefine = async (element, opts) => {
  const { define, context, __ref: ref } = element

  let defineObj = {}
  const hasGlobalDefine = context && isObject(context.define)
  if (isObject(define)) defineObj = { ...define }
  if (hasGlobalDefine) defineObj = { ...defineObj, ...context.define }

  for (const param in defineObj) {
    let elementProp = element[param]

    if (
      isFunction(elementProp) &&
      !isMethod(param, element) &&
      !isVariant(param)
    ) {
      ref.__exec[param] = elementProp
      const execParam = (elementProp = await exec(
        elementProp,
        element,
        element.state,
        element.context,
        opts
      ))

      if (execParam) {
        elementProp = element[param] = execParam.parse
          ? execParam.parse()
          : execParam
        ref.__defineCache[param] = elementProp
      }
    }

    const execParam = await defineObj[param](
      elementProp,
      element,
      element.state,
      element.context
    )
    if (execParam) element[param] = execParam
  }
  return element
}

export const throughUpdatedDefine = async (element, opts) => {
  const { context, define, __ref: ref } = element
  const changes = {}

  let obj = {}
  if (isObject(define)) obj = { ...define }
  if (isObject(context && context.define)) obj = { ...obj, ...context.define }

  for (const param in obj) {
    const execParam = ref.__exec[param]
    if (execParam)
      ref.__defineCache[param] = await execParam(
        element,
        element.state,
        element.context
      )
    const cached = await exec(
      ref.__defineCache[param],
      element,
      element.state,
      element.context,
      opts
    )
    const newExecParam = await obj[param](
      cached,
      element,
      element.state,
      element.context
    )
    if (newExecParam) element[param] = newExecParam
  }
  return changes
}
