'use strict'

import { deepMerge, mergeAndCloneIfArray, mergeIfExisted, mergeArray, flattenRecursive } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const applyPrototype = (element, parent, options = {}) => {
  // merge if proto is array
  console.log('--mergeAndCloneIfArray')
  const proto = mergeAndCloneIfArray(element.proto)
  console.log('---test')
  if (ENV !== 'test' || ENV !== 'development') delete element.proto

  let childProto
  if (parent) {
    // Assign parent attr to the element
    element.parent = parent
    if (!options.ignoreChildProto) childProto = parent && mergeAndCloneIfArray(parent.childProto)
    console.log('---childProto')
    console.log(childProto)
  }

  if (!proto && !childProto) return element

  // merge if both `proto` and `parent.childProto ` applied
  console.log('--mergeIfExisted')
  const mergedProto = mergeIfExisted(proto, childProto)

  // flatten inheritances into flat array
  console.log('--flattenRecursive')
  const flattenedArray = flattenRecursive(mergedProto, 'proto')

  // flatten prototypal inheritances
  console.log('--mergeArray')
  const flattenedProto = mergeArray(flattenedArray)

  // final merging with prototype
  console.log('--deepMerge')
  return deepMerge(element, flattenedProto)
}
