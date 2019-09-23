'use strict'

import create from './create'

var set = (parent, params) => {
  parent.node.innerHTML = ''
  create(params, parent, 'content')
}

export default set
