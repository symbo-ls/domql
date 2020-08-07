'use strict'

var remove = function (params) {
  params.node.remove()
  delete params.parent[params.key]
}

export default remove
