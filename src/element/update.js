'use strict'

import createNode from './createNode'
import { exec, registry } from './params'
import overwrite from '../utils/overwrite'

var update = (element, params) => {
  overwrite(element, params)
  console.log(element)
  createNode(element)
}

export default update
