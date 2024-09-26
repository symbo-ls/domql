'use strict'

import { exec, isArray, isFunction, isObject, isString, joinArrays, overwriteDeep } from '@domql/utils'
import { applyExtend } from '../extend'
import { registry } from '../mixins'
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

const replaceOnKeys = key => key.replace(/on\w+/g, match => match.substring(2))

export const createValidDomqlObjectFromSugar = (el, parent, key, options) => {
  const newElem = {
    props: {},
    on: {}
  }
  for (const k in el) {
    const prop = el[k]
    const isEvent = k.startsWith('on')
    if (isEvent) {
      const onKey = replaceOnKeys(prop)
      newElem.on[onKey] = prop
    // } else if (!isMethod && checkIfKeyIsProperty(k)) {
    }

    const isComponent = checkIfKeyIsComponent(k)
    const isRegistry = registry[k]
    if (isComponent || isRegistry) {
      newElem[k] = prop
    } else {
      newElem.props[k] = prop
    }
  }
  return newElem
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

export const overwriteVariant = (element, variant, variantProps) => {
  let variantElement = element[variant]
  if (!variantElement) return
  const props = isObject(variantProps) ? variantProps : {}
  if (isString(variantElement)) {
    variantElement = {
      extend: [{ props }, variantElement]
    }
  } else if (variantElement.extend) {
    variantElement = addAdditionalExtend({ props }, variantElement)
  }
  const extendedVariant = applyExtend(variantElement, element.parent)
  const { parent, ...rest } = extendedVariant
  return overwriteDeep(element, rest) // TODO: check why string is not working
  // return overwriteDeep(element, applyExtend(variantElement, element.parent)) // TODO: check why string is not working
}

export const applyVariant = (element) => {
  const { props } = element
  if (!hasVariantProp(element)) return element
  const { variant } = props
  overwriteVariant(element, `.${variant}`)

  const elKeys = Object.keys(element).filter((key) => isVariant(key))
  elKeys.forEach((variant) => {
    const slicedVariantElementKey = variant.slice(1)
    const variantElementProps = props[slicedVariantElementKey]
    if (variantElementProps) overwriteVariant(element, variant, variantElementProps)
  })

  return element
}

export const detectInfiniteLoop = arr => {
  const maxRepeats = 10 // Maximum allowed repetitions
  let pattern = []
  let repeatCount = 0

  for (let i = 0; i < arr.length; i++) {
    if (pattern.length < 2) {
      // Build the initial pattern with two consecutive elements
      pattern.push(arr[i])
    } else {
      // Check if the current element follows the repeating pattern
      if (arr[i] === pattern[i % 2]) {
        repeatCount++
      } else {
        // If there's a mismatch, reset the pattern and repeat counter
        pattern = [arr[i - 1], arr[i]]
        repeatCount = 1 // Reset to 1 because we start a new potential pattern
      }

      // If the pattern repeats more than `maxRepeats`, throw a warning
      if (repeatCount >= maxRepeats * 2) {
        if (ENV === 'test' || ENV === 'development') {
          console.warn('Warning: Potential infinite loop detected due to repeated sequence:', pattern)
        }
        return true
      }
    }
  }
}
