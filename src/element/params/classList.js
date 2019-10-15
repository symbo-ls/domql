'use strict'

var classList = (params, element) => {
  var { node } = element
  if (params === true) params = element.class = element.key
  node.classList = params.trim()
}

export default classList
