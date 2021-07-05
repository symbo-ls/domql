'use strict'

import root from './root'
import createNode from './createNode'
import { appendNode, assignNode } from './assign'
import { applyPrototype } from './proto'
import ID from './id'
import nodes from './nodes'
import set from './set'
import createState from './createState'
import createProps, { cache } from './createProps'
import update from './update'
import * as on from '../event/on'
import { assignClass } from './mixins/classList'
import { isFunction, isNumber, isString } from '../utils'
import { remove, lookup, log, keys, parse } from './methods'
import cacheNode from './cache'
// import { overwrite, clone, fillTheRest } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key, options = {}) => {
  // if PARENT is not given
  if (!parent) parent = root

  // if ELEMENT is not given
  if (element === undefined) element = {}
  if (element === null) return

  // define KEY
  const assignedKey = element.key || key || ID.next().value

  // if (assignedKey === 'all') debugger

  // if element is STRING
  if (isString(element) || isNumber(element)) {
    element = {
      text: element,
      tag: (!element.proto && parent.childProto && parent.childProto.tag) ||
      ((nodes.body.indexOf(key) > -1) && key) || 'string'
    }
  }

  // enable STATE
  element.state = createState(element, parent)

  console.groupCollapsed('Create:')
  console.log(element)

  // stack props
  cache.props = []

  // create PROTOtypal inheritance
  applyPrototype(element, parent, options)

  // set the PATH
  if (ENV === 'test' || ENV === 'development') {
    if (!parent.path) parent.path = []
    element.path = parent.path.concat(assignedKey)
  }

  // if it already HAS A NODE
  if (element.node) {
    return assignNode(element, parent, assignedKey)
  }

  // create and assign a KEY
  element.key = assignedKey

  // generate a CLASS name
  assignClass(element)

  // assign METHODS
  element.set = set
  element.update = update
  element.remove = remove
  element.lookup = lookup
  if (ENV === 'test' || ENV === 'development') {
    element.keys = keys
    element.parse = parse
    element.log = log
  }

  // run `on.init`
  if (element.on && isFunction(element.on.init)) {
    on.init(element.on.init, element, element.state)
  }

  // enable TRANSFORM in data
  if (!element.transform) element.transform = {}

  // enable CACHING
  if (!element.__cached) element.__cached = {}

  // enable EXEC
  if (!element.__exec) element.__exec = {}

  // enable CHANGES storing
  if (!element.__changes) element.__changes = []

  // enable CHANGES storing
  const hasRoot = parent.parent && parent.parent.key === ':root'
  if (!element.__root) element.__root = hasRoot ? parent : parent.__root

  // apply props settings
  createProps(element, parent)

  console.log('cache.props:')
  console.log(cache.props)
  console.log('applied props:')
  console.log(element.props)
  console.log('element:')
  console.log(element)

  console.groupEnd('Create:')

  // don't render IF in condition
  if (isFunction(element.if) && !element.if(element, element.state)) {
    // TODO: move as fragment
    const ifFragment = cacheNode({ tag: 'fragment' })
    element.__ifFragment = appendNode(ifFragment, parent.node)
    element.__ifFalsy = true
    return
  }

  // CREATE a real NODE
  createNode(element)

  // assign NODE
  assignNode(element, parent, key)

  // run `on.render`
  if (element.on && isFunction(element.on.render)) {
    on.render(element.on.render, element, element.state)
  }

  cache.props = []
  return element
}

export default create
