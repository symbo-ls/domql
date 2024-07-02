'use strict'

import { exec, isArray, isFunction, isObject, isString, joinArrays, overwriteDeep } from '@domql/utils'
import { applyExtend } from '../extend'
const ENV = process.env.NODE_ENV

const DOMQL_BUILTINS = [
  'extend',
  'childExtend',
  'childExtendRecursive',
  'define',
  'props',
  'state',
  'on',
  'if',
  'attr',
  'key',
  'tag'
]

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
    const isMethod = k.startsWith('$')
    if (isEvent) {
      const onKey = replaceOnKeys(prop)
      newElem.on[onKey] = prop
    } else if (!isMethod && checkIfKeyIsProperty(k)) {
      if (!DOMQL_BUILTINS.includes(k)) newElem.props[k] = prop
    } else if (checkIfKeyIsComponent(k)) {
      newElem[k] = prop
    } else {
      newElem[k] = prop
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
  return overwriteDeep(element, applyExtend(variantElement)) // TODO: check why string is not working
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
