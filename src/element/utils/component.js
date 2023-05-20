'use strict'

import { exec, isArray, isFunction, isObject, isString, overwriteDeep } from '@domql/utils'
const ENV = process.env.NODE_ENV

export const checkIfKeyIsComponent = (key) => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return
  const firstCharKey = key.slice(0, 1)
  return /^[A-Z]*$/.test(firstCharKey)
}

export const extendizeByKey = (element, parent, key) => {
  const { extend, props, state, childExtend, childProps, on } = element
  const hasComponentAttrs = extend || childExtend || props || state || on
  const componentKey = key.split('_')[0]
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
    const { extend } = element
    const preserveExtend = isArray(extend) ? extend : [extend]
    return {
      ...element,
      extend: [extendKey].concat(preserveExtend)
    }
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
  if (isObject(props) || isString(props.variant)) return true
}

export const applyVariant = (element) => {
  if (!hasVariantProp(element)) return element
  const { variant } = element.props
  const extendVariant = element[`.${variant}`] || element[`$${variant}`]
  if (extendVariant) {
    return overwriteDeep(element, extendVariant)
  }
  return element
}
