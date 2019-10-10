'use strict'

import create from './create'

var set = function (params) {
  if (this.content && this.content.node) {
    this.node.removeChild(this.content.node)
    delete this.content
  }

  if (params) {
    create(params, this, 'content')
  }

  return this
}

export default set
