'use strict'

const remove = function (params) {
  const element = this
  element.node.remove()
  delete element.parent[element.key]
}

export default remove
