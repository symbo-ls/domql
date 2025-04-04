'use strict'

import {
  isArray,
  isFunction,
  isObject,
  isString,
  deepClone,
  isNotProduction
} from '@domql/utils'
const ENV = process.env.NODE_ENV

export const generateHash = () => Math.random().toString(36).substring(2)

// hashing
export const extendStackRegistry = {}
export const extendCachedRegistry = {}

export const getHashedExtend = extend => {
  return extendStackRegistry[extend.__hash]
}

export const setHashedExtend = (extend, stack) => {
  const hash = generateHash()
  if (!isString(extend)) {
    extend.__hash = hash
  }
  extendStackRegistry[hash] = stack
  return stack
}

export const getExtendStackRegistry = (extend, stack) => {
  if (extend.__hash) {
    return stack.concat(getHashedExtend(extend))
  }
  return setHashedExtend(extend, stack) // stack .concat(hashedExtend)
}

// stacking
export const extractArrayExtend = (extend, stack, context) => {
  extend.forEach(each => flattenExtend(each, stack, context))
  return stack
}

export const deepExtend = (extend, stack, context) => {
  const extendOflattenExtend = extend.extend
  if (extendOflattenExtend) {
    flattenExtend(extendOflattenExtend, stack, context)
  }
  return stack
}

export const flattenExtend = (extend, stack, context) => {
  if (!extend) return stack
  if (isArray(extend)) return extractArrayExtend(extend, stack, context)
  if (isString(extend)) extend = fallbackStringExtend(extend, context)
  stack.push(extend)
  if (extend.extend) deepExtend(extend, stack, context)
  return stack
}

export const deepMergeExtend = (element, extend) => {
  for (const e in extend) {
    if (['parent', 'node', '__element'].indexOf(e) > -1) continue
    const elementProp = element[e]
    const extendProp = extend[e]
    if (elementProp === undefined) {
      element[e] = extendProp
    } else if (isObject(elementProp) && isObject(extendProp)) {
      deepMergeExtend(elementProp, extendProp)
    } else if (isArray(elementProp) && isArray(extendProp)) {
      element[e] = elementProp.concat(extendProp)
    } else if (isArray(elementProp) && isObject(extendProp)) {
      const obj = deepMergeExtend({}, elementProp)
      element[e] = deepMergeExtend(obj, extendProp)
    } else if (elementProp === undefined && isFunction(extendProp)) {
      element[e] = extendProp
    }
  }
  return element
}

export const cloneAndMergeArrayExtend = stack => {
  return stack.reduce((a, c) => {
    return deepMergeExtend(a, deepClone(c))
  }, {})
}

export const fallbackStringExtend = (
  extend,
  context,
  options = {},
  variant
) => {
  const COMPONENTS = (context && context.components) || options.components
  const PAGES = (context && context.pages) || options.pages
  if (isString(extend)) {
    const componentExists =
      COMPONENTS &&
      (COMPONENTS[extend + '.' + variant] ||
        COMPONENTS[extend] ||
        COMPONENTS['smbls.' + extend])
    const pageExists = PAGES && extend.startsWith('/') && PAGES[extend]
    if (componentExists) return componentExists
    else if (pageExists) return pageExists
    else {
      if (options.verbose && isNotProduction(ENV)) {
        console.warn('Extend is string but component was not found:', extend)
      }
      return {}
    }
  }
  return extend
}

// joint stacks
export const jointStacks = (extendStack, childExtendStack) => {
  return []
    .concat(extendStack.slice(0, 1))
    .concat(childExtendStack.slice(0, 1))
    .concat(extendStack.slice(1))
    .concat(childExtendStack.slice(1))
}

// init
export const getExtendStack = (extend, context) => {
  if (!extend) return []
  if (extend.__hash) return getHashedExtend(extend) || []
  const stack = flattenExtend(extend, [], context)
  return getExtendStackRegistry(extend, stack)
}

export const getExtendMerged = extend => {
  const stack = getExtendStack(extend)
  return cloneAndMergeArrayExtend(stack)
}

// export const replaceStringsWithComponents = (stack, context, options) => {
//   const COMPONENTS = (context && context.components) || options.components
//   return stack.map(v => {
//     if (isString(v)) {
//       const component = COMPONENTS[v]
//       return component
//     }
//     if (isString(v.extend)) {
//       v.extend = getExtendMerged(COMPONENTS[v.extend])
//     }
//     return v
//   })
// }
