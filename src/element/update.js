'use strict'

import createNode from './createNode'
import overwrite from '../utils/overwrite'
import * as on from '../event/on'
// import applyPrototype from './proto'

var update = function (params = {}) {
  var element = this
  overwrite(element, params)

  element.node.innerHTML = ''

  createNode(element)

  // run onRender
  if (element.on && typeof element.on.render === 'function') {
    on.render(element.on.render, element)
  }

  return this
}

export default update
