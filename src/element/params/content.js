'use strict'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node) => {
  if (param) {
    node.innerHTML = param
  }
}
