'use strict'

import deepMerge from '../utils/deepMerge'

/**
 * Applies multiple prototype level
 */
var recursiveProto = (element, proto) => {
  if (proto) {
    deepMerge(element, proto)
    if (proto.proto) recursiveProto(element, proto.proto)
  }
}

/**
 * Checks whether element has `proto` or is a part
 * of parent's `childProto` prototype
 */
export default (element, parent) => {
  // if (element.proto && element.childProto) {
  //   recursiveProto(element, parent.childProto)
  //   recursiveProto(element, element.proto)
  // }
  if (element.proto) {
    recursiveProto(element, element.proto)
  } else if (parent.childProto) {
    recursiveProto(element, parent.childProto)
  }
}
