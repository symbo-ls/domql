'use strict'

import { isFunction, exec, getProtoStack, jointStacks, cloneAndMergeArrayProto, deepMergeProto } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const applyPrototype = (element, parent, options = {}) => {
  if (isFunction(element)) element = exec(element, parent)

  const { proto } = element
  const protoStack = getProtoStack(proto)

  if (ENV !== 'test' || ENV !== 'development') delete element.proto

  let childProtoStack = []
  if (parent) {
    // Assign parent attr to the element
    element.parent = parent
    if (!options.ignoreChildProto) {
      childProtoStack = getProtoStack(parent.childProto)
    }
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
  } else if (!options.proto) return element

  if (options.proto) {
    const defaultOptionsProto = getProtoStack(options.proto)
    stack = [].concat(stack, defaultOptionsProto)
  }

  element.__proto = stack
  let mergedProto = cloneAndMergeArrayProto(stack)

  const component = exec(element.component || mergedProto.component, element)
  if (component && options.components && options.components[component]) {
    const componentProto = cloneAndMergeArrayProto(getProtoStack(options.components[component]))
    mergedProto = deepMergeProto(componentProto, mergedProto)
  }

  return deepMergeProto(element, mergedProto)
}
