'use strict'

import { joinArrays, removeDuplicatesInArray } from './array.js'
import { matchesComponentNaming } from './component.js'
import { deepClone, exec } from './object.js'
import { isArray, isFunction, isObject, isString } from './types.js'
const ENV = process.env.NODE_ENV

export const createExtendsFromKeys = key => {
  if (key.includes('+')) {
    return key.split('+').filter(matchesComponentNaming)
  }

  if (key.includes('_')) {
    const [first] = key.split('_')
    return [first]
  }

  if (key.includes('.') && !matchesComponentNaming(key.split('.')[1])) {
    const [first] = key.split('.')
    return [first]
  }

  return [key]
}

// Initial extend creation
export const createExtends = (element, parent, key) => {
  let __extends = []
  const keyExtends = createExtendsFromKeys(key)
  if (keyExtends) __extends = [...keyExtends]
  const elementExtends = element.extends
  if (elementExtends) {
    __extends = isArray(elementExtends)
      ? [...__extends, ...elementExtends]
      : [...__extends, elementExtends]
  }
  return __extends
}

export const addExtends = (newExtends, element) => {
  const { __ref: ref } = element
  let { __extends } = ref
  if (newExtends && !__extends.includes(newExtends)) {
    __extends = isArray(newExtends)
      ? [...__extends, ...newExtends]
      : [...__extends, newExtends]
    ref.__extends = __extends
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

export const getExtendsStackRegistry = (extend, stack) => {
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
  if (isString(extend)) {
    extend = mapStringsWithContextComponents(extend, context)
  }

  processed.add(extend)

  // Process extends first if they exist
  if (extend.extends) {
    deepExtend(extend, stack, context, processed)
  } else if (extend.props?.extends) {
    deepExtend(extend.props?.extends, stack, context, processed)
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

export const mapStringsWithContextComponents = (
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
      return
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
export const getExtendsStack = (extend, context) => {
  if (!extend) return []
  if (extend.__hash) return getHashedExtend(extend) || []
  const processed = new Set()
  const stack = flattenExtend(extend, [], context, processed)
  return getExtendsStackRegistry(extend, stack)
}

export const addExtend = (newExtends, elementExtends) => {
  if (!newExtends) return elementExtends
  const receivedArray = isArray(newExtends) ? newExtends : [newExtends]
  return joinArrays(receivedArray, elementExtends)
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

export const createElementExtends = (element, parent, options = {}) => {
  const { props, __ref: ref, context: elementContext } = element

  if (props.extends) addExtends(props.extends, element)

  inheritChildExtends(element, parent, options)
  inheritRecursiveChildExtends(element, parent, options)

  const context = elementContext || parent.context

  if (element.component) {
    addExtends(exec(element.component, element), element)
  }

  if (context.defaultExtends) {
    addExtends(context.defaultExtends, element)
  }

  return removeDuplicatesInArray(ref.__extends)
}

export const inheritChildExtends = (element, parent, options = {}) => {
  const { props, __ref: ref } = element
  const ignoreChildExtends =
    options.ignoreChildExtends || props.ignoreChildExtends
  if (!ignoreChildExtends) {
    if (parent.props?.childExtends) {
      addExtends(parent.props.childExtends, element)
    }
    if (parent.childExtends) addExtends(parent.childExtends, element)
  }
  return ref.__extends
}

export const inheritRecursiveChildExtends = (element, parent, options = {}) => {
  const { props, __ref: ref } = element
  const childExtendsRecursive =
    parent.childExtendsRecursive || parent.props?.childExtendsRecursive
  const ignoreChildExtendsRecursive =
    options.ignoreChildExtendsRecursive || props.ignoreChildExtendsRecursive
  const isText = element.key === '__text'
  if (childExtendsRecursive && !isText && !ignoreChildExtendsRecursive) {
    if (parent.props?.childExtendsRecursive) {
      addExtends(parent.props.childExtendsRecursive, element)
    }
    if (parent.childExtendsRecursive) {
      addExtends(parent.childExtendsRecursive, element)
    }
  }
  return ref.__extends
}

export const createExtendStack = (element, parent, options = {}) => {
  const { props, context, __ref: ref } = element

  // if (ENV !== 'test' && ENV !== 'development') delete element.extends
  const variant = element.variant || props.variant

  const __extends = removeDuplicatesInArray(
    ref.__extends.map(val => {
      return mapStringsWithContextComponents(val, context, options, variant)
    })
  )

  const stack = getExtendsStack(__extends, context)
  ref.__extendsStack = stack

  return ref.__extendsStack
}

export const finalizeExtend = (element, parent, options = {}) => {
  const { __ref: ref } = element
  const { __extendsStack } = ref
  const flattenExtends = cloneAndMergeArrayExtend(__extendsStack)

  return deepMergeExtend(element, flattenExtends)
}

export const applyExtend = (element, parent, options = {}) => {
  // const { __ref: ref } = element

  createElementExtends(element, parent, options)
  createExtendStack(element, parent, options)
  finalizeExtend(element, parent, options)

  return element
}

// export const applyExtend = (element, parent, options = {}) => {
//   if (isFunction(element)) element = exec(element, parent)

//   const { props, __ref } = element
//   let extend = props?.extends || element.extends || element.extend
//   const variant = props?.variant
//   const context = element.context || parent.context

//   extend = mapStringsWithContextComponents(extend, context, options, variant)

//   const extendStack = getExtendsStack(extend, context)

//   if (ENV !== 'test' || ENV !== 'development') delete element.extend

//   let childExtendStack = []
//   if (parent) {
//     element.parent = parent
//     // Assign parent attr to the element
//     if (!options.ignoreChildExtend && !(props && props.ignoreChildExtend)) {
//       childExtendStack = getExtendsStack(parent.childExtend, context)

//       // if (!options.ignoreChildExtend && !(props && exec(props, element).ignoreChildExtend)) {
//       //   const ignoreChildExtendsRecursive = props && exec(props, element).ignoreChildExtendsRecursive

//       const ignoreChildExtendsRecursive = props && props.ignoreChildExtendsRecursive
//       if (parent.childExtendsRecursive && !ignoreChildExtendsRecursive) {
//         const canExtendRecursive = element.key !== '__text'
//         if (canExtendRecursive) {
//           const childExtendsRecursiveStack = getExtendsStack(parent.childExtendsRecursive, context)
//           // add error if childExtendsRecursive contains element which goes to infinite loop
//           childExtendStack = childExtendStack.concat(childExtendsRecursiveStack)
//           element.childExtendsRecursive = parent.childExtendsRecursive
//         }
//       }
//     }
//   }

//   const extendLength = extendStack.length
//   const childExtendLength = childExtendStack.length

//   let stack = []
//   if (extendLength && childExtendLength) {
//     stack = jointStacks(extendStack, childExtendStack)
//   } else if (extendLength) {
//     stack = extendStack
//   } else if (childExtendLength) {
//     stack = childExtendStack
//   } else if (!context.defaultExtends) return element

//   if (context.defaultExtends) {
//     if (!mainExtend) {
//       const defaultOptionsExtend = getExtendsStack(context.defaultExtends, context)
//       mainExtend = cloneAndMergeArrayExtend(defaultOptionsExtend)
//       delete mainExtend.extend
//     }
//     stack = [].concat(stack, mainExtend)
//   }

//   if (__ref) __ref.__extend = stack
//   let mergedExtend = cloneAndMergeArrayExtend(stack)

//   const COMPONENTS = (context && context.components) || options.components
//   const component = exec(element.component || mergedExtend.component, element)
//   if (component && COMPONENTS && COMPONENTS[component]) {
//     const componentExtend = cloneAndMergeArrayExtend(getExtendsStack(COMPONENTS[component]))
//     mergedExtend = deepMergeExtend(componentExtend, mergedExtend)
//   }

//   const merged = deepMergeExtend(element, mergedExtend)
//   return merged
// }
