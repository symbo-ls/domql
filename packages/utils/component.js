'use strict'

import { applyAdditionalExtend } from './extend.js'
import { exec } from './object.js'
import { isArray, isObject, isString } from './types.js'

const ENV = process.env.NODE_ENV

export const checkIfKeyIsComponent = key => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return
  const firstCharKey = key.slice(0, 1)
  return /^[A-Z]*$/.test(firstCharKey)
}

export const extractComponentKeyFromElementKey = key => {
  return key.includes('+')
    ? key.split('+') // get array of componentKeys
    : key.includes('_')
    ? [key.split('_')[0]] // get component key split _
    : key.includes('.') && !checkIfKeyIsComponent(key.split('.')[1])
    ? [key.split('.')[0]] // get component key split .
    : [key]
}

export function getCapitalCaseKeys (obj) {
  return Object.keys(obj).filter(key => /^[A-Z]/.test(key))
}

export function getSpreadChildren (obj) {
  return Object.keys(obj).filter(key => /^\d+$/.test(key))
}

export const getChildrenComponentsByKey = (key, el) => {
  if (key === el.key || el.__ref.__componentKey === key) {
    return el
  }

  // Check if the prop is "extend" and it's either a string or an array
  if (el.extends) {
    // Add the value of the extend key to the result array
    const foundString = isString(el.extends) && el.extends === key
    const foundInArray =
      isArray(el.extends) && el.extends.filter(v => v === key).length
    if (foundString || foundInArray) return el
  }

  if (el.parent && el.parent.childExtends) {
    // Add the value of the extend key to the result array
    const foundString =
      isString(el.parent.childExtends) && el.parent.childExtends === key
    const foundInArray =
      isArray(el.parent.childExtends) &&
      el.parent.childExtends.filter(v => v === key).length
    if (foundString || foundInArray) return el
  }
}

export function applyKeyComponentAsExtend (initialElement, parent, key) {
  const element = exec(initialElement, parent)
  const { context } = parent || {}
  const extendFromKey = extractComponentKeyFromElementKey(key)[0]
  const isExtendKeyComponent = context?.components?.[extendFromKey]

  const isComponent = /^[A-Z]/.test(key)
  if (
    !isComponent ||
    !isExtendKeyComponent ||
    element === isExtendKeyComponent
  ) {
    return element
  }

  return applyAdditionalExtend(extendFromKey, element)
}

export const applyComponentFromContext = (element, parent, options) => {
  const { context } = element

  if (!context || !context.components) return

  const { components } = context
  const execExtend = exec(element.extends, element)

  const applyStringExtend = extendKey => {
    const componentExists =
      components[extendKey] || components['smbls.' + extendKey]
    if (componentExists) element.extends = componentExists
    else {
      if ((ENV === 'test' || ENV === 'development') && options.verbose) {
        console.warn(extendKey, 'is not in library', components, element)
        console.warn('replacing with ', {})
      }
      element.extends = {}
    }
  }

  if (isString(execExtend)) applyStringExtend(execExtend)
  if (isArray(execExtend)) {
    if (isString(execExtend[0])) applyStringExtend(execExtend[0])
  }
}
