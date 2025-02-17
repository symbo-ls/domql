'use strict'

import { addEventInOn } from './events.js'
import { joinArrays } from './array.js'
import { exec } from './object.js'
import { isArray, isFunction, isObject, isString } from './types.js'

const ENV = process.env.NODE_ENV

export const checkIfKeyIsComponent = (key) => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return
  const firstCharKey = key.slice(0, 1)
  return /^[A-Z]*$/.test(firstCharKey)
}

export const checkIfKeyIsProperty = (key) => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return
  const firstCharKey = key.slice(0, 1)
  return /^[a-z]*$/.test(firstCharKey)
}

export const addExtend = (newExtend, elementExtend) => {
  if (!newExtend) return elementExtend
  const originalArray = isArray(elementExtend) ? elementExtend : [elementExtend]
  const receivedArray = isArray(newExtend) ? newExtend : [newExtend]
  return joinArrays(receivedArray, originalArray)
}

export const applyAdditionalExtend = (newExtend, element, extendKey = 'extends') => {
  if (!newExtend) return element
  const elementExtend = element[extendKey]
  const originalArray = isArray(elementExtend) ? elementExtend : [elementExtend]
  const receivedArray = isArray(newExtend) ? newExtend : [newExtend]
  const extend = joinArrays(receivedArray, originalArray)
  return { ...element, extends: extend }
}

export const checkIfSugar = (element, parent, key) => {
}

export const extractComponentKeyFromElementKey = (key) => {
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

export function applyKeyComponentAsExtend (initialElement, parent, key) {
  const element = exec(initialElement, parent)
  const { context } = parent || {}
  const extendFromKey = extractComponentKeyFromElementKey(key)[0]
  const isExtendKeyComponent = context?.components?.[extendFromKey]

  const isComponent = /^[A-Z]/.test(key)
  if (!isComponent || !isExtendKeyComponent || element === isExtendKeyComponent) return element

  return applyAdditionalExtend(extendFromKey, element)
}

const propMappings = [
  'attr',
  'style',
  'text',
  'html',
  'content',
  'data',
  'class',
  'state',
  'scope',
  'routes',
  '$router',
  'deps',
  'extends',
  'children',
  'childExtends',
  'childExtendsRecursive',
  'props',
  'if',
  'define',
  '__name',
  '__ref',
  '__hash',
  '__text',
  'key',
  'tag',
  'query',
  'parent',
  'node',
  'variables',
  'on',
  'component',
  'context'
]

/**
 * Reorganizes and normalizes properties of an element
 * @param {Object} element - The element to process
 * @param {Object} parent - The parent context
 * @returns {Object} - The processed element
 */
export function redefineProperties (element) {
  if (!element.props) element.props = {}
  if (!element.on) element.on = {}
  const cachedKeys = []

  for (const key in element) {
    const value = (element)[key]

    const hasDefine = isObject(element.define?.[key])
    const hasGlobalDefine = isObject(element.context?.define?.[key])
    const isComponent = /^[A-Z]/.test(key)
    const isSpreadedElement = /^\d+$/.test(key)
    const isPropMapping = propMappings.includes(key)
    if (!isComponent && !isSpreadedElement && !isPropMapping && !hasDefine && !hasGlobalDefine) {
      element.props[key] = value
      delete element[key]
      cachedKeys.push(key)
      continue
    }
  }

  for (const key in element.props) {
    const value = element.props[key]

    const isEvent = key.startsWith('on')
    const isFn = isFunction(value)

    if (isEvent && isFn) {
      addEventInOn(key, element)
      delete element.props[key]
      continue
    }

    if (cachedKeys.includes(key)) continue

    const hasDefine = isObject(element.define?.[key])
    const hasGlobalDefine = isObject(element.context?.define?.[key])
    const isComponent = /^[A-Z]/.test(key)
    const isSpreadedElement = /^\d+$/.test(key)
    const isPropMapping = propMappings.includes(key)
    if (isComponent || isSpreadedElement || isPropMapping || hasDefine || hasGlobalDefine) {
      element[key] = value
      delete element.props[key]
      continue
    }
  }

  return element
}

export const applyComponentFromContext = (element, parent, options) => {
  const { context } = element

  if (!context || !context.components) return

  const { components } = context
  const execExtend = exec(element.extends, element)

  const applyStringExtend = (extendKey) => {
    const componentExists = components[extendKey] || components['smbls.' + extendKey]
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

export const isVariant = (param) => {
  if (!isString(param)) return
  const firstCharKey = param.slice(0, 1)
  // return (firstCharKey === '.' || firstCharKey === '$')
  return (firstCharKey === '.')
}

export const hasVariantProp = (element) => {
  const { props } = element
  if (isObject(props) && isString(props.variant)) return true
}

export const getChildrenComponentsByKey = (key, el) => {
  if (key === el.key || el.__ref.__componentKey === key) {
    return el
  }

  // Check if the prop is "extend" and it's either a string or an array
  if (el.extends) {
    // Add the value of the extend key to the result array
    const foundString = isString(el.extends) && el.extends === key
    const foundInArray = isArray(el.extends) && el.extends.filter(v => v === key).length
    if (foundString || foundInArray) return el
  }

  if (el.parent && el.parent.childExtends) {
    // Add the value of the extend key to the result array
    const foundString = isString(el.parent.childExtends) && el.parent.childExtends === key
    const foundInArray = isArray(el.parent.childExtends) && el.parent.childExtends.filter(v => v === key).length
    if (foundString || foundInArray) return el
  }
}

export const getExtendsInElement = (obj) => {
  let result = []

  function traverse (o) {
    for (const key in o) {
      if (Object.hasOwnProperty.call(o, key)) {
        // Check if the key starts with a capital letter and exclude keys like @mobileL, $propsCollection
        if (checkIfKeyIsComponent(key)) {
          result.push(key)
        }

        // Check if the key is "extend" and it's either a string or an array
        if (key === 'extends' || key === 'extends') {
          // Add the value of the extend key to the result array
          if (typeof o[key] === 'string') {
            result.push(o[key])
          } else if (Array.isArray(o[key])) {
            result = result.concat(o[key])
          }
        }

        // If the property is an object, traverse it
        if (typeof o[key] === 'object' && o[key] !== null) {
          traverse(o[key])
        }
      }
    }
  }

  traverse(obj)
  return result
}

export const setContentKey = (el, opts = {}) => {
  const { __ref: ref } = el
  const contentElementKey = opts.contentElementKey
  if ((contentElementKey !== 'content' && contentElementKey !== ref.contentElementKey) || !ref.contentElementKey) {
    ref.contentElementKey = contentElementKey || 'content'
  } else ref.contentElementKey = 'content'
  if (contentElementKey !== 'content') opts.contentElementKey = 'content'
  return ref.contentElementKey
}
