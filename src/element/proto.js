'use strict'

import { deepMerge, isArray, deepClone } from '../utils'

export const cleanWithNode = proto => delete proto.node && proto

/**
 * Flattens deep level prototypes into an array
 */
export const flattenProtosAsArray = (proto, protos = []) => {
  protos.push(proto)
  let protoOfProto = proto.proto
  if (protoOfProto) {
    if (isArray(protoOfProto)) protoOfProto = mergeProtosArray(protoOfProto)
    flattenProtosAsArray(protoOfProto, protos)
  }
  return protos
}

/**
 * Merges array prototypes
 */
export const mergeProtosArray = arr => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c)), {})
}

/**
 * Flattens deep level prototypes into an flat object
 */
export const flattenPrototype = (proto) => {
  const flattenedArray = mergeProtosArray(flattenProtosAsArray(proto))

  if (flattenedArray.proto) delete flattenedArray.proto

  return deepClone(flattenedArray)
}

/**
 * Applies multiple prototype level
 */
export const deepProto = (element, proto) => {
  // if proto presented as array
  if (isArray(proto)) {
    proto = mergeProtosArray(proto)
  }

  // flatten prototypal inheritances
  const flatten = flattenPrototype(proto)

  // merge with prototype
  return deepMerge(element, flatten)
  // return overwrite(element, flatten)
}

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const applyPrototype = (element) => {
  const { parent, proto } = element

  /** Merge with `proto` */
  if (proto) {
    deepProto(element, proto)
  }

  /** Merge with parent's `childProto` */
  if (parent && parent.childProto) {
    deepProto(element, parent.childProto)
  }

  return element
}
