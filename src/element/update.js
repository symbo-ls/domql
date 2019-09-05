'use strict'

import createNode from './createNode'
import { exec, registry } from './params'
import overwrite from '../utils/overwrite'

var update = (element, params) => {
  console.log(element, params)
  overwrite(element, params)
  createNode(element)
}

export default update
