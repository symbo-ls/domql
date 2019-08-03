'use strict'

import Err from '../res/error'
import tree from './tree'
import createElement from './createElement'
import method from './method'
import applyPrototype from './proto'

/**
 * Creating a domQL element using passed parameters
 */
var create = (element, parent, key) => {
  // If parent is not given
  if (!parent) parent = tree.root

  // If element is not given
  if (!element) return Err('CantCreateWithoutNode')

  // If element is string
  if (typeof element === 'string') {
    element = { text: element, tag: (parent.childProto && parent.childProto.tag) || 'string' }
  }

  // Assign parent reference to the element
  element.parent = parent

  // if proto, or inherited proto
  applyPrototype(element, parent)

  // create and assign a key
  var assignedKey = element.key || key || parseInt(Math.random() * 10000)
  element.key = assignedKey

  // create Element class
  createElement(element)

  method.assignNode(element, parent, key)

  return element
}

export default create
