'use strict'

import create from './create'

var set = function (params, enter, leave) {
  var element = this

  if (element.content && element.content.node) {
    // leave(element, () => {
    element.node.removeChild(element.content.node)
    delete element.content
    // })
  }

  if (params) {
    // enter(element, () => {
    create(params, element, 'content')
    // })
  }

  return element
}

export default set
