'use strict'

import deepMerge from '../utils/deepMerge'

/**
 * Sets a prototype an element
 */

var recursiveProto = (protoOfElem) => {
  while (protoOfElem.proto) {
    deepMerge(protoOfElem, protoOfElem.proto)
    recursiveProto(protoOfElem.proto)
  }
}

export default (element, parent) => {
  if (element.proto) {
    recursiveProto(element.proto)
    deepMerge(element, element.proto)
  } else if (parent.childProto) {
    recursiveProto(parent.childProto)
    deepMerge(element, parent.childProto)
  }
}
