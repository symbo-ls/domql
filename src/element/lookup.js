'use strict'

var lookup = function (key) {
  var element = this
  var { parent } = element

  while (parent.key !== key) {
    parent = parent.parent
    if (!parent) break
  }

  return parent
}

export default lookup
