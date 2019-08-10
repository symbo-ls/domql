'use strict'

import Err from '../res/error'
import tree from './tree'
import createNode from './createNode'
import method from './method'
import applyPrototype from './proto'
import ID from './id'
import nodes from './nodes'

/**
 * Creating a domQL element using passed parameters
 */
var create = (element, parent, key) => {
  // If parent is not given
  if (!parent) parent = tree.root

  // If element is not given
  if (!element) return Err('CantCreateWithoutNode')

  // define key
  var assignedKey = element.key || key || ID.next().value

  // If element is string
  if (typeof element === 'string') {
    element = {
      text: element,
      tag: (!element.proto && parent.childProto && parent.childProto.tag) ||
        ((nodes.body.indexOf(key) > -1) && key) || 'string'
    }
  }

  // Assign parent reference to the element
  element.parent = parent

  // if proto, or inherited proto
  applyPrototype(element, parent)

  // create and assign a key
  element.key = assignedKey

  // create Element class
  createNode(element)

  method.assignNode(element, parent, key)

  return element
}

export default create
