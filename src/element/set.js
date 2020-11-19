'use strict'

import create from './create'

const set = function (params, enter, leave) {
  const element = this

  if (element.content && element.content.node) {
    // leave(element, () => {
    element.node.removeChild(element.content.node)
    delete element.content
    // })
  }

  if (params) create(params, element, 'content')

  return element
}

export default set
