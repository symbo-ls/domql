'use strict'

import { isFunction, exec } from '@domql/utils'
import {
  getExtendStack,
  jointStacks,
  cloneAndMergeArrayExtend,
  deepMergeExtend,
  fallbackStringExtend
} from './utils/index.js'
import { addExtend } from '../utils/component.js'

const ENV = process.env.NODE_ENV

let mainExtend

/**
 * Checks whether element has `extend` or is a part
 * of parent's `childExtends` extend
 */
export const applyExtend = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  const { props, __ref } = element
  // let extend = applyAdditionalExtend(props?.extends || element.extends, element)
  let extend = props?.extends ? addExtend(props.extends, element.extends) : element.extends
  const variant = props?.variant
  const context = element.context || parent.context

  extend = fallbackStringExtend(extend, context, options, variant)

  const extendStack = getExtendStack(extend, context)

  if (ENV !== 'test' && ENV !== 'development') delete element.extends

  let childExtendsStack = []
  if (parent) {
    element.parent = parent

    // Assign parent attr to the element
    if (!options.ignoreChildExtends && !(props && props.ignoreChildExtends)) {
      const childExtends = parent.props?.childExtends
        ? addExtend(parent.props.childExtends, element.childExtends)
        : parent.childExtends

      childExtendsStack = getExtendStack(childExtends, context)

      // if (!options.ignoreChildExtends && !(props && exec(props, element).ignoreChildExtends)) {
      //   const ignoreChildExtendsRecursive = props && exec(props, element).ignoreChildExtendsRecursive

      // const ignoreChildExtendsRecursive = props && props.ignoreChildExtendsRecursive
      // if (parent.childExtendsRecursive && !ignoreChildExtendsRecursive) {
      //   const canExtendRecursive = element.key !== '__text'
      //   if (canExtendRecursive) {
      //     const childExtendsRecursiveStack = getExtendStack(parent.childExtendsRecursive, context)
      //     // add error if childExtendsRecursive contains element which goes to infinite loop
      //     childExtendsStack = childExtendsStack.concat(childExtendsRecursiveStack)
      //     element.childExtendsRecursive = parent.childExtendsRecursive
      //   }
      // }
    }
  }

  const extendLength = extendStack.length
  const childExtendsLength = childExtendsStack.length

  let stack = []
  if (extendLength && childExtendsLength) {
    stack = jointStacks(extendStack, childExtendsStack)
  } else if (extendLength) {
    stack = extendStack
  } else if (childExtendsLength) {
    stack = childExtendsStack
  }

  if (context.defaultExtends) {
    if (!mainExtend) {
      const defaultOptionsExtend = getExtendStack(context.defaultExtends, context)
      mainExtend = cloneAndMergeArrayExtend(defaultOptionsExtend)
      delete mainExtend.extends
    }
    stack = [].concat(stack, mainExtend)
  } else if (!context.defaultExtends) return element

  if (__ref) __ref.__extends = stack
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
