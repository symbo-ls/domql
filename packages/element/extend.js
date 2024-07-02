'use strict'

import { isFunction, exec } from '@domql/utils'
import {
  getExtendStack,
  jointStacks,
  cloneAndMergeArrayExtend,
  deepMergeExtend,
  fallbackStringExtend
} from './utils'

const ENV = process.env.NODE_ENV

let mainExtend

/**
 * Checks whether element has `extend` or is a part
 * of parent's `childExtend` extend
 */
export const applyExtend = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  let { extend, props, __ref } = element
  const context = element.context || parent.context

  extend = fallbackStringExtend(extend, context, options)

  const extendStack = getExtendStack(extend, context)

  if (ENV !== 'test' || ENV !== 'development') delete element.extend

  let childExtendStack = []
  if (parent) {
    element.parent = parent
    // Assign parent attr to the element
    if (!options.ignoreChildExtend && !(props && props.ignoreChildExtend)) {
      childExtendStack = getExtendStack(parent.childExtend, context)

      const ignoreChildExtendRecursive = props && props.ignoreChildExtendRecursive
      if (parent.childExtendRecursive && !ignoreChildExtendRecursive) {
        const canExtendRecursive = element.key !== '__text'
        if (canExtendRecursive) {
          const childExtendRecursiveStack = getExtendStack(parent.childExtendRecursive, context)
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
    if (!mainExtend) {
      const defaultOptionsExtend = getExtendStack(options.extend, context)
      mainExtend = cloneAndMergeArrayExtend(defaultOptionsExtend)
      delete mainExtend.extend
    }
    stack = [].concat(stack, mainExtend)
  }

  // check if array contains string extends
  if (__ref) __ref.__extend = stack
  let mergedExtend = cloneAndMergeArrayExtend(stack)

  // apply `component:` property
  const COMPONENTS = (context && context.components) || options.components
  const component = exec(element.component || mergedExtend.component, element)
  if (component && COMPONENTS && COMPONENTS[component]) {
    const componentExtend = cloneAndMergeArrayExtend(getExtendStack(COMPONENTS[component]))
    mergedExtend = deepMergeExtend(componentExtend, mergedExtend)
  }

  const merged = deepMergeExtend(element, mergedExtend)
  return merged
}
