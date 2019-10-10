'use strict'

import createNode from './createNode'
import overwrite from '../utils/overwrite'
// import applyPrototype from './proto'

var update = function (params = {}) {
  overwrite(this, params)
  this.node.innerHTML = ''
  // debugger
  // applyPrototype(this)
  createNode(this)
}

export default update
