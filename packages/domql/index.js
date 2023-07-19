'use strict'

import { TREE, create as createElement } from '@domql/element'
import { createNode } from '@domql/render'

const create = (element, parent, key, options) => {
  createElement(element, parent, key, options)
  createNode(element, options)
}

export default {
  TREE,
  create
}
