'use strict'

import { exec, isArray, isFunction, isObject, isString, overwriteDeep } from '@domql/utils'
import { applyExtend } from '../extend'
const ENV = process.env.NODE_ENV

export const checkIfKeyIsComponent = (key) => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return
  const firstCharKey = key.slice(0, 1)
  return /^[A-Z]*$/.test(firstCharKey)
}

export const addAdditionalExtend = (newExtend, element) => {
  const { extend } = element
  const preserveExtend = isArray(extend) ? extend : [extend]
  return {
    ...element,
    extend: [newExtend].concat(preserveExtend)
  }
}

export const extendizeByKey = (element, parent, key) => {
  const { tag, extend, props, state, childExtend, childProps, on } = element
  const hasComponentAttrs = tag || extend || childExtend || props || state || on
  const componentKey = key.includes('_')
    ? key.split('_')[0]
    : key.includes('.') ? key.split('.')[0] : key
  const extendKey = componentKey || key

  if (!hasComponentAttrs || childProps) {
    return {
      extend: extendKey,
      props: { ...element }
    }
  } else if (!extend || extend === true) {
    return {
      ...element,
      extend: extendKey
    }
  } else if (extend) {
    addAdditionalExtend(extendKey, element)
  } else if (isFunction(element)) {
    return {
      extend: extendKey,
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
    if (components[execExtend]) element.extend = components[execExtend]
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
