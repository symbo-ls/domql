'use strict'

import cloneDeep from 'lodash.clonedeep'
import deepMerge from '../utils/deepMerge'

/**
 * Applies multiple prototype level
 */
var recursiveProto = (element, proto, cloneOriginal = true) => {
  if (proto) {
    deepMerge(element, proto, cloneOriginal)
    if (proto.proto) recursiveProto(element, proto.proto)
  }
}

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export default (element, parent) => {
  if (element.proto && (parent && parent.childProto)) {
    var proto = cloneDeep(element.proto)
    deepMerge(proto, parent.childProto)
    recursiveProto(element, proto, false)
  } else {
    if (element.proto) {
      recursiveProto(element, element.proto)
    } else if (parent && parent.childProto) {
      recursiveProto(element, parent.childProto)
    }
  }
}
