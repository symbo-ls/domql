'use strict'

import { exec, isArray, isFunction, isObject, isString, joinArrays } from '.'
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

export const addAdditionalExtend = (newExtend, element) => {
  const { extend: elementExtend } = element
  const originalArray = isArray(elementExtend) ? elementExtend : [elementExtend]
  const receivedArray = isArray(newExtend) ? newExtend : [newExtend]
  const extend = joinArrays(receivedArray, originalArray)
  return { ...element, extend }
}

export const extendizeByKey = (element, parent, key) => {
  const { context } = parent
  const { tag, extend, props, attr, state, childExtend, childProps, on, if: condition, data } = element
  const hasComponentAttrs = extend || childExtend || props || state || on || condition || attr || data

  const extendFromKey = key.includes('+')
    ? key.split('+') // get array of componentKeys
    : key.includes('_')
      ? [key.split('_')[0]] // get component key split _
      : key.includes('.') && !checkIfKeyIsComponent(key.split('.')[1])
        ? [key.split('.')[0]] // get component key split .
        : [key]

  // console.log(extendFromKey)
  // console.log(context, context?.components)
  // console.log(element)
  const isExtendKeyComponent = context && context.components[extendFromKey]

  if (element === isExtendKeyComponent) return element
  else if (!hasComponentAttrs || childProps) {
    return {
      extend: extendFromKey,
      tag,
      props: { ...element }
    }
  } else if (!extend || extend === true) {
    return {
      ...element,
      tag,
      extend: extendFromKey
    }
  } else if (extend) {
    return addAdditionalExtend(extendFromKey, element)
  } else if (isFunction(element)) {
    return {
      extend: extendFromKey,
      tag,
      props: { ...exec(element, parent) }
    }
  }
}

export const applyKeyComponentAsExtend = (element, parent, key) => {
  return extendizeByKey(element, parent, key) || element
}

export const applyComponentFromContext = (element, parent, options) => {
  const { context } = element

  if (!context || !context.components) return

  const { components } = context
  const { extend } = element
  const execExtend = exec(extend, element)
  if (isString(execExtend)) {
    const componentExists = components[execExtend] || components['smbls.' + execExtend]
    if (componentExists) element.extend = componentExists
    else {
      if ((ENV === 'test' || ENV === 'development') && options.verbose) {
        console.warn(execExtend, 'is not in library', components, element)
        console.warn('replacing with ', {})
      }
      element.extend = {}
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
  if (el.extend) {
    // Add the value of the extend key to the result array
    const foundString = isString(el.extend) && el.extend === key
    const foundInArray = isArray(el.extend) && el.extend.filter(v => v === key).length
    if (foundString || foundInArray) return el
  }

  if (el.parent && el.parent.childExtend) {
    // Add the value of the extend key to the result array
    const foundString = isString(el.parent.childExtend) && el.parent.childExtend === key
    const foundInArray = isArray(el.parent.childExtend) && el.parent.childExtend.filter(v => v === key).length
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
        if (key === 'extend') {
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
