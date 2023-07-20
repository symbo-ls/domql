'use strict'

import { TREE, create as createElement } from '@domql/element'

const create = (element, parent, key, options) => {
  return createElement(element, parent, key, options)
}

export default {
  TREE,
  create
}
