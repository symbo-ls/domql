'use strict'

import cloneDeep from 'lodash.clonedeep'
import { deepMerge, isArray } from '../utils'

/**
 * Merges array prototypes
 */
export const mergeArrayProto = proto => {
  const clonedProto = cloneDeep(proto[0])
  for (let i = 1; i < proto.length; i++) deepMerge(clonedProto, proto[i])
  return clonedProto
}

/**
 * Applies multiple prototype level
 */
export const deepProto = (element, proto) => {
  proto = cloneDeep(proto) // TODO: remove for some cases
  if (isArray(proto)) proto = mergeArrayProto(proto)
  deepMerge(element, proto)
  if (proto.proto) deepProto(element, proto.proto)
}

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export const applyPrototype = (element) => {
  var { parent, proto } = element

  /** Merge with `proto` */
  if (proto) {
    // var clonedProto = cloneDeep(proto)
    deepProto(element, proto)
    delete element.proto
  }

  /** Merge with parent's `childProto` */
  if (parent && parent.childProto) {
    // var clonedChildProto = cloneDeep(parent.childProto)
    deepProto(element, parent.childProto)
  }
}
