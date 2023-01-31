'use strict'

import { isFunction, exec, getExtendStack, jointStacks, cloneAndMergeArrayExtend, deepMergeExtend, isString } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `extend` or is a part
 * of parent's `childExtend` extend
 */
export const applyExtend = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  let { extend, props, context } = element
  const COMPONENTS = context.components || options.components

  if (isString(extend)) extend = COMPONENTS[extend]
  const extendStack = getExtendStack(extend)

  if (ENV !== 'test' || ENV !== 'development') delete element.extend

  let childExtendStack = []
  if (parent) {
    // Assign parent attr to the element
    element.parent = parent
    if (!options.ignoreChildExtend) {
      if (props && props.ignoreChildExtend) return

      childExtendStack = getExtendStack(parent.childExtend)

      if (parent.childExtendRecursive) {
        const childExtendRecursiveStack = getExtendStack(parent.childExtendRecursive)
        childExtendStack = childExtendStack.concat(childExtendRecursiveStack)
        element.childExtendRecursive = parent.childExtendRecursive
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

  element.__extend = stack
  let mergedExtend = cloneAndMergeArrayExtend(stack)

  const component = exec(element.component || mergedExtend.component, element)
  if (component && COMPONENTS && COMPONENTS[component]) {
    const componentExtend = cloneAndMergeArrayExtend(getExtendStack(COMPONENTS[component]))
    mergedExtend = deepMergeExtend(componentExtend, mergedExtend)
  }

  return deepMergeExtend(element, mergedExtend)
}
