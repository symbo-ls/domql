'use strict'

import create from './create'

var set = function (params) {
  this.node.innerHTML = ''
  create(params, this, 'content')
}

export default set
