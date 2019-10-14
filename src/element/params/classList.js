'use strict'

var classList = (params, element) => {
  if (params) {
    var { node } = element
    node.classList = params === true ? element.key : params.trim()
  }
}

export default classList
