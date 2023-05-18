'use strict'

import { exec, isArray, isFunction, isString } from '@domql/utils'
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

  if (!hasComponentAttrs || childProps) {
    return {
      extend: componentKey || key,
      props: { ...element }
    }
  } else if (!extend || extend === true) {
    return {
      ...element,
      extend: componentKey || key
    }
  } else if (extend) {
    const preserveExtend = isArray(extend) ? extend : [extend]
    return {
      ...element,
      extend: [componentKey || key].concat(preserveExtend)
    }
  } else if (isFunction(element)) {
    return {
      extend: componentKey || key,
      props: { ...element }
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
