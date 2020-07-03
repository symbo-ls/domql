'use strict'

import cloneDeep from 'lodash.clonedeep'
import { deepMerge, isArray } from '../utils'

var mergeArrayProto = proto => {
  const clonedProto = cloneDeep(proto[0])
  for (let i = 1; i < proto.length; i++) deepMerge(clonedProto, proto[i])
  return clonedProto
}

/**
 * Applies multiple prototype level
 */
var recursiveProto = (element, proto, clone = false) => {
  if (clone) proto = cloneDeep(proto)
  if (isArray(proto)) proto = mergeArrayProto(proto)
  deepMerge(element, proto)
  if (proto.proto) recursiveProto(element, proto.proto)
}

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export default (element) => {
  var { parent } = element

  /** If it has both `proto` and `childProto` */
  if (element.proto && (parent && parent.childProto)) {
    var clonedProto = cloneDeep(element.proto)
    deepMerge(clonedProto, parent.childProto, true)
    recursiveProto(element, clonedProto, false)
  } else if (element.proto) { /** If it has only `proto` */
    recursiveProto(element, element.proto, true)
  } else if (parent && parent.childProto) { /** If it has only `childProto` */
    recursiveProto(element, parent.childProto, true)
  }
}
