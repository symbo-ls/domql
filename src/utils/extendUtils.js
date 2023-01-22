'use strict'

import { isArray, isFunction, isObject } from '@domql/utils'

export const generateHash = () => Math.random().toString(36).substring(2)

// hashing
export const extendStackRegistry = {}
export const extendCachedRegistry = {}

export const getHashedExtend = extend => {
  return extendStackRegistry[extend.__hash]
}

export const setHashedExtend = (extend, stack) => {
  const hash = generateHash()
  extend.__hash = hash
  extendStackRegistry[hash] = stack
  return stack
}

export const getExtendStackRegistry = (extend, stack) => {
  if (extend.__hash) { return stack.concat(getHashedExtend(extend)) }
  return setHashedExtend(extend, stack) // stack .concat(hashedExtend)
}

// stacking
export const extractArrayExtend = (extend, stack) => {
  extend.forEach(each => flattenExtend(each, stack))
  return stack
}

export const deepExtend = (extend, stack) => {
  const extendOflattenExtend = extend.extend
  if (extendOflattenExtend) {
    flattenExtend(extendOflattenExtend, stack)
  }
  return stack
}

export const flattenExtend = (extend, stack) => {
  if (!extend) return stack
  if (isArray(extend)) return extractArrayExtend(extend, stack)
  stack.push(extend)
  if (extend.extend) deepExtend(extend, stack)
  return stack
}

// merging
export const deepCloneExtend = obj => {
  const o = {}
  for (const prop in obj) {
    if (['parent', 'node', '__element', '__root', '__key'].indexOf(prop) > -1) continue
    const objProp = obj[prop]
    if (isObject(objProp)) {
      o[prop] = deepCloneExtend(objProp)
    } else if (isArray(objProp)) {
      o[prop] = objProp.map(x => x)
    } else o[prop] = objProp
  }
  return o
}

export const deepMergeExtend = (element, extend) => {
  for (const e in extend) {
    if (['parent', 'node', '__element', '__root', '__key'].indexOf(e) > -1) continue
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
    return deepMergeExtend(a, deepCloneExtend(c))
  }, {})
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
export const getExtendStack = extend => {
  if (!extend) return []
  if (extend.__hash) return getHashedExtend(extend) || []
  const stack = flattenExtend(extend, [])
  return getExtendStackRegistry(extend, stack)
}

export const getExtendMerged = extend => {
  const stack = getExtendStack(extend)
  return cloneAndMergeArrayExtend(stack)
}
