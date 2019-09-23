'use strict'

import createNode from './createNode'
import overwrite from '../utils/overwrite'

var update = (element, params) => {
  overwrite(element, params)
  element.node.innerHTML = ''
  createNode(element)
}

export default update
