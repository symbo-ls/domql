'use strict'

import { joinArrays } from './array.js'
import { deepMerge, exec, overwriteDeep } from './object.js'
import { isArray, isFunction, isObject, isObjectLike, isString } from './types.js'

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
  return { ...element, extend }
}

export const checkIfSugar = (element, parent, key) => {
}

export const extractComponentKeyFromKey = (key) => {
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

export const extendizeByKey = (initialElement, parent, key) => {
  const element = exec(initialElement, parent)
  const { context } = parent
  const extendFromKey = extractComponentKeyFromKey(key)
  const isExtendKeyComponent = context && context.components[extendFromKey]

  // console.log('--------')
  // console.log(element)

  if (element === isExtendKeyComponent) return element

  const newElem = { props: element }

  const extend = (isExtendKeyComponent && newElem.props.extends)
    ? addExtend(extendFromKey, newElem.props.extends)
    : (newElem.props.extends || extendFromKey)
  if (extend) {
    newElem.props.extends = extend
  }

  const propMappings = [
    'define', 'deps', 'on', 'content', 'routes', '$router', 'data', 'context', 'scope'
  ]

  for (const prop in newElem.props) {
    if (prop === 'props') continue

    const existingValue = newElem[prop]
    const newValue = newElem.props[prop]

    if (propMappings.includes(prop)) {
      // if (existingValue && newValue) {
      if (isFunction(existingValue)) {
        newElem.extends = addExtend({ [prop]: existingValue }, newElem.extends)
        newElem[prop] = newValue
      } else if (isObjectLike(existingValue)) {
        overwriteDeep(existingValue, newValue)
      } else {
        newElem[prop] = newValue
      }
      // } else {
      //   newElem[prop] = newValue
      // }
      delete newElem.props[prop]
    }

    const isComponent = /^[A-Z]/.test(prop)
    const isSpreadedElement = /^\d+$/.test(prop)
    if (isComponent || isSpreadedElement) {
      if (!newElem[prop]) newElem[prop] = {}
      if (isObjectLike(existingValue)) {
        overwriteDeep(newElem[prop], newElem.props[prop])
      } else {
        newElem[prop] = newValue
      }
      delete newElem.props[prop]
    }
  }

  if (newElem.props.props) {
    if (isFunction(newElem.props.props)) {
      newElem.extends = addExtend({ props: newElem.props.props }, newElem.extends)
    } else deepMerge(newElem.props, newElem.props.props)
    delete newElem.props.props
  }

  // console.log(newElem)

  return newElem
}

export const applyKeyComponentAsExtend = (element, parent, key) => {
  return extendizeByKey(element, parent, key) || element
}

export const applyComponentFromContext = (element, parent, options) => {
  const { context } = element

  if (!context || !context.components) return

  const { components } = context
  const execExtend = exec(element.extends, element)
  if (isString(execExtend)) {
    const componentExists = components[execExtend] || components['smbls.' + execExtend]
    if (componentExists) element.extends = componentExists
    else {
      if ((ENV === 'test' || ENV === 'development') && options.verbose) {
        console.warn(execExtend, 'is not in library', components, element)
        console.warn('replacing with ', {})
      }
      element.extends = {}
    }
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
