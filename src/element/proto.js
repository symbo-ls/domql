'use strict'

import deepMerge from '../utils/deepMerge'

/**
 * Sets a prototype an element
 */
var recursiveProto = (element, proto) => {
  if (proto) {
    deepMerge(element, proto)
    if (proto.proto) recursiveProto(element, proto.proto)
  }
}

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
