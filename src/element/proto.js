'use strict'

import { deepMerge, mergeIfArray, mergeIfExisted, deepClone, mergeArray } from '../utils'

/**
 * Flattens deep level prototypes into an array
 */
export const flattenDeepProtosAsArray = (proto, protos = []) => {
  proto = mergeIfArray(proto)
  protos.push(proto)

  const protoOfProto = proto.proto
  if (protoOfProto) {
    flattenDeepProtosAsArray(protoOfProto, protos)
  }

  return protos
}

/**
 * Flattens deep level prototypes into an flat object
 */
export const flattenPrototype = (proto) => {
  const flattenedArray = mergeArray(flattenDeepProtosAsArray(proto))

  // proto cleanup
  if (flattenedArray.proto) delete flattenedArray.proto

  return deepClone(flattenedArray)
}

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const applyPrototype = (element, parent) => {
  // Assign parent reference to the element
  element.parent = parent

  // merge if proto is array
  const proto = mergeIfArray(element.proto)

  // merge if parent proto is array
  const childProto = mergeIfArray(parent.childProto)

  if (!proto && !childProto) return element

  // merge if both applied
  const mergedProto = mergeIfExisted(proto, childProto)

  // flatten prototypal inheritances
  const flattenedProtos = flattenPrototype(mergedProto)

  // merge with prototype
  return deepMerge(element, flattenedProtos)
}
