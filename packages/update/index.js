'use strict'

import { DEFAULT_METHODS } from '@domql/registry'

import {
  overwriteDeep,
  diff,
  isFunction,
  isObject,
  isString,
  isNumber,
  exec
} from '@domql/utils'
import { on } from '@domql/event'
import { updateProps } from '@domql/props'
import { create, applyTransform } from '@domql/create'

const DEFAULT_OPTIONS = {
  stackChanges: false,
  cleanExec: true,
  preventRecursive: false
}

const applyUpdateInit = (params, element) => {
  on.initUpdate(element)
  if (isString(params) || isNumber(params)) params = { text: params }
  return params
}

const applyChanges = (params, element) => {
  const { ref } = element
  const changes = diff(params, element)

  const hasChanges = Object.keys(changes).length
  if (changes && hasChanges) {
    ref.__updates = [].concat(changes, ref.__updates)

    // console.group('applyChanges')
    console.log(changes)
    overwriteDeep(changes, element)
    // console.groupEnd('applyChanges')
  }

  return params
}

const applyPropsUpdate = (params, element, options) => {
  if (params && !isObject(params.props)) return params // it will prevent to update `inherit` or `match` prop values
  const { ref } = element
  ref.props = updateProps(params.props, element, ref.parent)
  on.propsUpdated(element)
  return params
}

const applyAttrUpdate = (params, element, options) => {
  const { ref } = element
  if (!ref.attr) ref.attr = {}
  for (const attrKey in params.attr) {
    ref.attr[attrKey] = exec(params.attr[attrKey], element, element.state)
  }
  return params
}

const updateOnEachAvailable = (params, element, key, options) => {
  const { ref } = element
  const { children, childrenKeys } = ref

  // move value to ref.children
  if (childrenKeys.indexOf(key) === -1) {
    const value = params[key]
    childrenKeys.push(key)
    element[key] = value
    const newElement = create(value, element, key, options)
    return children.push(newElement)
  }

  // apply global options
  const useOption = options[updateOnEachAvailable]
  if (useOption) useOption(element, key)
}

const updateOnEach = (params, element, options) => {
  for (const key in params) {
    const isMethod = DEFAULT_METHODS[key]
    if (isMethod && isFunction(isMethod)) isMethod(element, element.ref.state)
    const hasDefine = element.define && params.define[key]
    if (hasDefine && isFunction(hasDefine)) element.ref[key] = hasDefine(element, element.ref.state)
    if (!isMethod && !hasDefine) updateOnEachAvailable(params, element, key, options)
  }
  return params
}

const updateTransform = (params, element, options) => {
  applyTransform(element, element.key, options)
  return params
}

const updateChildren = (params, element, options) => {
  const { ref } = element
  const { children } = ref

  if (children && children.length) {
    children.map(child => {
      update(element[child.key] || {}, child, options)
      return child
    })
  }

  return params
}

const triggerOnUpdate = (params, element, options) => {
  const { ref } = element
  on.update(params, element, element.state)
  return ref.__updates[0]
}

export const update = (params, element, options = DEFAULT_OPTIONS) => [
  applyUpdateInit,
  applyChanges,
  applyPropsUpdate,
  applyAttrUpdate,
  updateOnEach,
  updateTransform,
  updateChildren,
  triggerOnUpdate
].reduce((prev, current) => current(prev, element, options), params)

DEFAULT_METHODS.update = update
