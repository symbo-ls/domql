'use strict'

import { isFunction, exec, isString } from '@domql/utils'
import { getExtendStack, jointStacks, cloneAndMergeArrayExtend, deepMergeExtend, replaceStringsWithComponents } from './utils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `extend` or is a part
 * of parent's `childExtend` extend
 */
export const applyExtend = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  let { extend, props, context, __ref } = element

  const COMPONENTS = (context && context.components) || options.components
  if (isString(extend)) {
    if (COMPONENTS && COMPONENTS[extend]) extend = COMPONENTS[extend]
    else {
      if (ENV !== 'test' || ENV !== 'development') {
        console.warn('Extend is string but component was not found:', extend)
      } extend = {}
    }
  }

  const extendStack = getExtendStack(extend)

  if (ENV !== 'test' || ENV !== 'development') delete element.extend

  let childExtendStack = []
  if (parent) {
    element.parent = parent
    // Assign parent attr to the element
    if (!options.ignoreChildExtend) {
      if (props && props.ignoreChildExtend) return

      childExtendStack = getExtendStack(parent.childExtend)

      // if (parent.childExtendRecursive && (props && !props.ignoreChildExtendRecursive)) {
      if (parent.childExtendRecursive) {
        const canExtendRecursive = !props?.ignoreChildExtendRecursive && element.key !== '__text'
        if (canExtendRecursive) {
          const childExtendRecursiveStack = getExtendStack(parent.childExtendRecursive)
          // add error if childExtendRecursive contains element which goes to infinite loop
          childExtendStack = childExtendStack.concat(childExtendRecursiveStack)
          element.childExtendRecursive = parent.childExtendRecursive
        }
      }
    }
  }

  const extendLength = extendStack.length
  const childExtendLength = childExtendStack.length

  let stack = []
  if (extendLength && childExtendLength) {
    stack = jointStacks(extendStack, childExtendStack)
  } else if (extendLength) {
    stack = extendStack
  } else if (childExtendLength) {
    stack = childExtendStack
  } else if (!options.extend) return element

  if (options.extend) {
    const defaultOptionsExtend = getExtendStack(options.extend)
    stack = [].concat(stack, defaultOptionsExtend)
  }

  if (__ref) __ref.__extend = stack
  const findAndReplaceStrings = replaceStringsWithComponents(stack, COMPONENTS)
  let mergedExtend = cloneAndMergeArrayExtend(findAndReplaceStrings)

  const component = exec(element.component || mergedExtend.component, element)
  if (component && COMPONENTS && COMPONENTS[component]) {
    const componentExtend = cloneAndMergeArrayExtend(getExtendStack(COMPONENTS[component]))
    mergedExtend = deepMergeExtend(componentExtend, mergedExtend)
  }

  return deepMergeExtend(element, mergedExtend)
}
