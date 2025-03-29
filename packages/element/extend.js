'use strict'

import { isFunction, exec } from '@domql/utils'
import {
  getExtendStack,
  jointStacks,
  cloneAndMergeArrayExtend,
  deepMergeExtend,
  fallbackStringExtend
} from './utils/index.js'

const ENV = process.env.NODE_ENV

let mainExtend

/**
 * Checks whether element has `extend` or is a part
 * of parent's `childExtend` extend
 */
export const applyExtend = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  const { props, __ref } = element
  let extend = props?.extends || element.extends || element.extend
  const variant = props?.variant
  const context = element.context || parent.context

  extend = fallbackStringExtend(extend, context, options, variant)

  const extendStack = getExtendStack(extend, context)

  if (ENV !== 'testing' || ENV !== 'development') delete element.extend

  let childExtendStack = []
  if (parent) {
    element.parent = parent
    // Assign parent attr to the element
    if (!options.ignoreChildExtend && !(props && props.ignoreChildExtend)) {
      childExtendStack = getExtendStack(parent.childExtend, context)

      // if (!options.ignoreChildExtend && !(props && exec(props, element).ignoreChildExtend)) {
      //   const ignoreChildExtendRecursive = props && exec(props, element).ignoreChildExtendRecursive

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
  } else if (!context.defaultExtends) return element

  if (context.defaultExtends) {
    if (!mainExtend) {
      const defaultOptionsExtend = getExtendStack(context.defaultExtends, context)
      mainExtend = cloneAndMergeArrayExtend(defaultOptionsExtend)
      delete mainExtend.extend
    }
    stack = [].concat(stack, mainExtend)
  }

  if (__ref) __ref.__extend = stack
  let mergedExtend = cloneAndMergeArrayExtend(stack)

  const COMPONENTS = (context && context.components) || options.components
  const component = exec(element.component || mergedExtend.component, element)
  if (component && COMPONENTS && COMPONENTS[component]) {
    const componentExtend = cloneAndMergeArrayExtend(getExtendStack(COMPONENTS[component]))
    mergedExtend = deepMergeExtend(componentExtend, mergedExtend)
  }

  const merged = deepMergeExtend(element, mergedExtend)
  return merged
}
