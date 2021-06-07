'use strict'

import { deepMerge, mergeAndCloneIfArray, mergeIfExisted, mergeArray, flattenRecursive } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const applyPrototype = (element, parent, options = {}) => {
  // merge if proto is array
  const proto = mergeAndCloneIfArray(element.proto)
  if (ENV !== 'test' || ENV !== 'development') delete element.proto

  let childProto
  if (parent) {
    // Assign parent attr to the element
    element.parent = parent
    if (!options.ignoreChildProto) childProto = parent && mergeAndCloneIfArray(parent.childProto)
  }

  if (!proto && !childProto) return element

  // merge if both `proto` and `parent.childProto ` applied
  const mergedProto = mergeIfExisted(proto, childProto)

  // flatten inheritances into flat array
  const flattenedArray = flattenRecursive(mergedProto, 'proto')

  // flatten prototypal inheritances
  const flattenedProto = mergeArray(flattenedArray)

  // final merging with prototype
  return deepMerge(element, flattenedProto)
}
