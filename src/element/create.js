'use strict'

import tree from './tree'
import createNode from './createNode'
import { assignNode } from './assign'
import { applyPrototype } from './proto'
import ID from './id'
import nodes from './nodes'
import set from './set'
import update from './update'
import remove from './remove'
import lookup from './lookup'
import * as on from '../event/on'
import { assignClass } from './params/classList'
import { isFunction } from '../utils'
// import { overwrite, clone, fillTheRest } from '../utils'

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key) => {
  // if PARENT is not given
  if (!parent) parent = tree

  // if ELEMENT is not given
  if (element === undefined) element = {}
  if (element === null) return

  // run `on.init`
  if (element.on && isFunction(element.on.init)) {
    on.init(element.on.init, element)
  }

  // define KEY
  const assignedKey = element.key || key || ID.next().value

  // if element is STRING
  if (typeof element === 'string' || typeof element === 'number') {
    element = {
      text: element,
      tag: (!element.proto && parent.childProto && parent.childProto.tag) ||
      ((nodes.body.indexOf(key) > -1) && key) || 'string'
    }
  }

  // create PROTOtypal inheritance
  applyPrototype(element, parent)

  // set the PATH
  if (!parent.path) parent.path = []
  element.path = parent.path.concat(assignedKey)

  // if it already HAS A NODE
  if (element.node) {
    return assignNode(element, parent, assignedKey)
  }

  // create and assign a KEY
  element.key = assignedKey

  // generate a CLASS name
  assignClass(element)

  // don't render IF in condition
  if (isFunction(element.if) && !element.if(element)) return

  // enable CACHING in data
  if (!element.__cached) element.__cached = {}

  // enable TRANSFORM in data
  if (!element.transform) element.transform = {}

  // enable TRANSFORM in data
  if (!element.__exec) element.__exec = {}

  // enable STATE
  if (!element.state) {
    element.state = parent.state || {}
    element.__cached.isOwnState = false
  }

  // CREATE a real NODE
  createNode(element)

  // assign METHODS
  element.set = set
  element.update = update
  element.remove = remove
  element.lookup = lookup

  // assign NODE
  assignNode(element, parent, key)

  // run `on.render`
  if (element.on && isFunction(element.on.render)) {
    on.render(element.on.render, element)
  }

  return element
}

export default create
