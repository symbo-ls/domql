'use strict'

import { joinArrays } from './array.js'
import {
  matchesComponentNaming,
  extractComponentKeyFromElementKey
} from './component.js'
import { deepClone, exec } from './object.js'
import { isArray, isFunction, isObject, isString } from './types.js'
const ENV = process.env.NODE_ENV

export function isContextComponent (initialElement, parent, key) {
  const { context } = parent || {}
  const extendFromKey = extractComponentKeyFromElementKey(key)[0]
  return context?.components?.[extendFromKey] || context?.pages?.[extendFromKey]
}

export const createExtends = (element, parent, key) => {
  const __extends = []
  const keyExtends = isContextComponent(key)
  if (keyExtends) __extends.push(keyExtends)
  const elementExtends = element.extends
  if (elementExtends) {
    return isArray(elementExtends)
      ? __extends.concat(elementExtends)
      : __extends.push(elementExtends)
  }
  return __extends
}

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
export const extractArrayExtend = (
  extend,
  stack,
  context,
  processed = new Set()
) => {
  for (const each of extend) {
    if (isArray(each)) {
      extractArrayExtend(each, stack, context, processed)
    } else {
      flattenExtend(each, stack, context, processed)
    }
  }
  return stack
}

export const deepExtend = (extend, stack, context, processed = new Set()) => {
  const extendOflattenExtend = extend.extends
  if (extendOflattenExtend) {
    flattenExtend(extendOflattenExtend, stack, context, processed)
  }
  // Remove extends property before adding to stack
  const cleanExtend = { ...extend }
  delete cleanExtend.extends
  if (Object.keys(cleanExtend).length > 0) {
    stack.push(cleanExtend)
  }
  return stack
}

export const flattenExtend = (
  extend,
  stack,
  context,
  processed = new Set()
) => {
  if (!extend) return stack
  if (processed.has(extend)) return stack

  if (isArray(extend)) {
    return extractArrayExtend(extend, stack, context, processed)
  }
  if (isString(extend)) extend = fallbackStringExtend(extend, context)

  processed.add(extend)

  // Process extends first if they exist
  if (extend.extends) {
    deepExtend(extend, stack, context, processed)
  } else {
    stack.push(extend)
  }

  return stack
}

export const deepMergeExtend = (element, extend) => {
  for (const e in extend) {
    if (['parent', 'node', '__element'].indexOf(e) > -1) continue
    const elementProp = element[e]
    const extendProp = extend[e]
    if (e === '__proto__') continue
    if (elementProp === undefined) {
      if (
        Object.prototype.hasOwnProperty.call(extend, e) &&
        !['__proto__', 'constructor', 'prototype'].includes(e)
      ) {
        element[e] = extendProp
      }
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
      if (options.verbose && (ENV === 'test' || ENV === 'development')) {
        console.warn('Extend is string but component was not found:', extend)
      }
      return {}
    }
  }
  return extend
}

// joint stacks
export const jointStacks = (extendStack, childExtendsStack) => {
  return []
    .concat(extendStack.slice(0, 1))
    .concat(childExtendsStack.slice(0, 1))
    .concat(extendStack.slice(1))
    .concat(childExtendsStack.slice(1))
}

// init
export const getExtendStack = (extend, context) => {
  if (!extend) return []
  if (extend.__hash) return getHashedExtend(extend) || []
  const processed = new Set()
  const stack = flattenExtend(extend, [], context, processed)
  return getExtendStackRegistry(extend, stack)
}

export const getExtendMerged = extend => {
  const stack = getExtendStack(extend)
  return cloneAndMergeArrayExtend(stack)
}

export const addExtend = (newExtends, elementExtends) => {
  if (!newExtends) return elementExtends
  const receivedArray = isArray(newExtends) ? newExtends : [newExtends]
  return joinArrays(receivedArray, elementExtends)
}

export const addAsExtends = (newExtends, element) => {
  if (!newExtends) return element
  const extend = addExtend(newExtends, element.extends)
  return { ...element, extends: extend }
}

export const getExtendsInElement = obj => {
  let result = []

  function traverse (o) {
    for (const key in o) {
      if (Object.hasOwnProperty.call(o, key)) {
        // Check if the key starts with a capital letter and exclude keys like @mobileL, $propsCollection
        if (matchesComponentNaming(key)) {
          result.push(key)
        }

        // Check if the key is "extend" and it's either a string or an array
        if (key === 'extends') {
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

let mainExtend

export const createExtendElement = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)
  const { props, __ref } = element
  // const __extends = ref.__extends

  let extend = props?.extends
    ? addExtend(props.extends, element.extends)
    : element.extends
  const variant = props?.variant
  const context = element.context || parent.context

  extend = fallbackStringExtend(extend, context, options, variant)

  if (parent) {
    element.parent = parent
  }

  return { element, extend, context, props, __ref }
}

export const createExtendStack = (element, parent, options = {}) => {
  const context = element.context
  const extendStack = getExtendStack(element.extends, context)

  if (ENV !== 'test' && ENV !== 'development') delete element.extends

  let childExtendsStack = []
  if (
    parent &&
    !options.ignoreChildExtends &&
    !(element.props && element.props.ignoreChildExtends)
  ) {
    const childExtends = parent.props?.childExtends
      ? addExtend(parent.props.childExtends, element.childExtends)
      : parent.childExtends

    childExtendsStack = getExtendStack(childExtends, context)
  }

  let stack = []
  if (extendStack.length && childExtendsStack.length) {
    stack = jointStacks(extendStack, childExtendsStack)
  } else if (extendStack.length) {
    stack = extendStack
  } else if (childExtendsStack.length) {
    stack = childExtendsStack
  }

  if (context.defaultExtends) {
    if (!mainExtend) {
      const defaultOptionsExtend = getExtendStack(
        context.defaultExtends,
        context
      )
      mainExtend = cloneAndMergeArrayExtend(defaultOptionsExtend)
      delete mainExtend.extends
    }
    stack = [].concat(stack, mainExtend)
  }

  return stack
}

export const finalizeExtend = (element, stack, options = {}) => {
  const { __ref: ref } = element
  if (ref && typeof ref === 'object' && !('__proto__' in ref)) {
    ref.__extendsStack = stack
  }

  const context = element.context
  let mergedExtend = cloneAndMergeArrayExtend(stack)

  const COMPONENTS = (context && context.components) || options.components
  const component = exec(element.component || mergedExtend.component, element)
  if (component && COMPONENTS && COMPONENTS[component]) {
    const componentExtend = cloneAndMergeArrayExtend(
      getExtendStack(COMPONENTS[component])
    )
    mergedExtend = deepMergeExtend(componentExtend, mergedExtend)
  }

  return deepMergeExtend(element, mergedExtend)
}

export const applyExtend = (element, parent, options = {}) => {
  const { element: preparedElement, __ref } = createExtendElement(
    element,
    parent,
    options
  )

  const stack = createExtendStack(preparedElement, parent, options)
  return finalizeExtend(preparedElement, stack, __ref, options)
}
