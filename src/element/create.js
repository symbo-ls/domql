'use strict'

import Err from '../res/error'
import tree from './tree'
import createElement from './createElement'
import method from './method'
import setPrototype from '../utils/setPrototype'

var create = (elemParams, parent, key) => {
  // If parent is not given
  if (!parent) parent = tree.root

  // If elemParams is not given
  if (!elemParams) return Err('CantCreateWithoutNode')

  // if proto
  if (elemParams.proto) {
    setPrototype(elemParams, elemParams.proto)
  }

  // If elemParams is string
  if (typeof elemParams === 'string') {
    elemParams = { key, text: elemParams, tag: 'string' }
  }

  // create Element class
  var element = createElement(elemParams, key)

  // Assign parent reference to the element
  element.parent = parent

  method.assign(element, parent)

  return element
}

export default create
