'use strict'

import { isFunction, exec } from '@domql/utils'
import { getProtoStack, jointStacks, cloneAndMergeArrayProto, deepMergeProto } from './protoUtils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const extendElement = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  const { extends: ext } = element

  // merge if proto is array
  // const proto = mergeAndCloneIfArray(element.proto, v => {
  //   if (v.props) cache.props.push(v.props)
  // })

  const protoStack = getProtoStack(ext)

  if (ENV !== 'development') delete element.extends

  // debugger

  let childProtoStack = []
  if (!options.ignoreChildProto) {
    childProtoStack = getProtoStack(parent.childExtends)
  }

  const protoLength = protoStack.length
  const childProtoLength = childProtoStack.length

  let stack = []
  if (protoLength && childProtoLength) {
    stack = jointStacks(protoStack, childProtoStack)
  } else if (protoLength) {
    stack = protoStack
  } else if (childProtoLength) {
    stack = childProtoStack
  } else return element

  element.ref.extends = stack
  const mergedProto = cloneAndMergeArrayProto(stack)

  delete mergedProto.__hash

  return deepMergeProto(element, mergedProto)

  // final merging with prototype
}
