'use strict'

import { isFunction, exec } from '@domql/utils'
import { getExtendStack, jointStacks, cloneAndMergeArrayExtend, deepMergeExtend } from './extendUtils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `extend` or is a part
 * of parent's `childExtend` extendtype
 */
export const extendElement = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  const { extend: ext } = element

  // merge if extend is array
  // const extend = mergeAndCloneIfArray(element.extend, v => {
  //   if (v.props) cache.props.push(v.props)
  // })

  const extendStack = getExtendStack(ext)

  if (ENV !== 'development') delete element.extends

  let childExtendStack = []
  if (!options.ignoreChildExtend) {
    childExtendStack = getExtendStack(parent.childExtends)
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
  } else return element

  if (options.extends) {
    const defaultOptionsExtend = getExtendStack(options.extends)
    stack = [].concat(defaultOptionsExtend, stack)
  }

  element.ref.extends = stack
  const mergedExtend = cloneAndMergeArrayExtend(stack)

  delete mergedExtend.__hash

  return deepMergeExtend(element, mergedExtend)

  // final merging with extendtype
}
