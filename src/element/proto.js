'use strict'

import { deepMerge, mergeIfArray, mergeIfExisted, deepClone, mergeArray, flattenRecursive } from '../utils'

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
  const flattenedProto = mergeArray(
    flattenRecursive(mergedProto, 'proto')
  )

  // deep clone the prototype
  const clonedProto = deepClone(flattenedProto)

  // final merging with prototype
  return deepMerge(element, clonedProto)
}
