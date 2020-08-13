'use strict'

var remove = function (params) {
  var element = this
  element.node.remove()
  delete element.parent[element.key]
}

export default remove
