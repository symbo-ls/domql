'use strict'

const lookup = function (key) {
  const element = this
  let { parent } = element

  while (parent.key !== key) {
    parent = parent.parent
    if (!parent) return
  }

  return parent
}

export default lookup
