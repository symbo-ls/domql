'use strict'

import { isFunction, exec } from '@domql/utils'
import { getProtoStack, jointStacks, cloneAndMergeArrayProto, deepMergeProto } from './protoUtils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const applyPrototype = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  const { proto } = element

  // merge if proto is array
  // const proto = mergeAndCloneIfArray(element.proto, v => {
  //   if (v.props) cache.props.push(v.props)
  // console.log('v.propsIN_PROTO:')
  // console.log(v.props)
  // })

  // console.log(proto)
  const protoStack = getProtoStack(proto)

  if (ENV !== 'test' || ENV !== 'development') delete element.proto

  // console.log(parent.childProto)

  // console.log(element)
  // console.log(proto)
  // console.log(protoStack)
  // debugger

  let childProtoStack = []
  if (parent) {
    // Assign parent attr to the element
    element.parent = parent
    if (!options.ignoreChildProto) {
      childProtoStack = getProtoStack(parent.childProto)
    }
  }

  // console.log(proto, parent && parent.childProto)
  // console.log(protoStack, childProtoStack)

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

  element.__proto = stack
  const mergedProto = cloneAndMergeArrayProto(stack)

  // console.log(mergedProto)
  return deepMergeProto(element, mergedProto)

  // final merging with prototype
}
