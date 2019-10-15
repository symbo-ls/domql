'use strict'

import cloneDeep from 'lodash.clonedeep'
import deepMerge from '../utils/deepMerge'

/**
 * Applies multiple prototype level
 */
var recursiveProto = (element, proto, cloneProto = true) => {
  deepMerge(element, proto, cloneProto)
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
    var proto = cloneDeep(element.proto)
    deepMerge(proto, parent.childProto, true)
    recursiveProto(element, proto, false)
  } else if (element.proto) { /** If it has only `proto` */
    recursiveProto(element, element.proto, true)
  } else if (parent && parent.childProto) { /** If it has only `childProto` */
    recursiveProto(element, parent.childProto, true)
  }
}
