'use strict'

import { isObject, isFunction, isString, exec, is, isNode, isUndefined } from '@domql/utils'
import { ROOT } from '@domql/tree'
import { createKey } from '@domql/key'
import { TAGS } from '@domql/registry'
import { triggerEventOn } from '@domql/event'
import { appendNode, assignNode } from '@domql/render'
import { isMethod, lookup, setProps, remove, spotByPath } from '@domql/methods'
import { assignClass } from '@domql/classlist'
import { cacheNode, detectTag } from '@domql/node'
import { createState } from '@domql/state'
import { createProps } from '@domql/props'

import createNode from './node'
import { applyExtend } from './extend'
import set from './set'
import update from './update'
import { log, keys, parse, parseDeep, nextElement, previousElement } from './methods'
import { registry } from './mixins'
import { throughInitialExec } from './iterate'
import OPTIONS from './options'

import {
  applyComponentFromContext,
  applyKeyComponentAsExtend,
  applyVariant,
  checkIfKeyIsComponent,
  isVariant
} from './utils/component'
import { removeContentElement, updateContentElement } from './remove'

const ENV = process.env.NODE_ENV

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key, options = OPTIONS.create || {}) => {
  if (options && !OPTIONS.create) {
    OPTIONS.create = options
    OPTIONS.create.context = element.context || options.context
  }

  // if ELEMENT is not given
  if (element === undefined) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'element is undefined in', parent && parent.__ref && parent.__ref.path)
    }
    element = {}
  }
  if (isString(key) && key.slice(0, 2 === '__')) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'seems like to be in __ref')
    }
  }
  if (element === null) return
  if (element === true) element = { text: true }

  // if element is extend
  if (element.__hash) {
    element = { extend: element }
  }

  // if PARENT is not given
  if (!parent) parent = ROOT
  if (isNode(parent)) {
    parent = ROOT[`${key}_parent`] = { key: ':root', node: parent }
  }

  // if element is STRING
  if (checkIfPrimitive(element)) {
    element = applyValueAsText(element, parent, key)
  }

  // define KEY
  const assignedKey = (element.key || key || createKey()).toString()

  if (checkIfKeyIsComponent(assignedKey)) {
    element = applyKeyComponentAsExtend(element, parent, assignedKey)
  }

  // TODO: move as define plugins
  // Responsive rendering
  if (checkIfMedia(assignedKey)) {
    element = applyMediaProps(element, parent, assignedKey)
  }

  if (element.__ref) element.__ref.origin = element
  else element.__ref = { origin: element } // eslint-disable-line 
  const __ref = element.__ref

  // assign context
  applyContext(element, parent, options)
  const { context } = element

  if (context && context.components) {
    applyComponentFromContext(element, parent, options)
  }

  // create EXTEND inheritance
  applyExtend(element, parent, options)

  // create and assign a KEY
  element.key = assignedKey

  // Only resolve extends, skip everything else
  if (options.onlyResolveExtends) {
    return resolveExtends(element, parent, options)
  }

  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildExtend) delete options.ignoreChildExtend
  }

  addCaching(element, parent)

  addMethods(element, parent)

  // enable STATE
  element.state = createState(element, parent)

  // don't render IF in condition
  checkIf(element, parent)

  // if it already HAS a NODE
  if (element.node && __ref.__if) { // TODO: check on if
    return assignNode(element, parent, assignedKey)
  }

  // apply props settings
  if (__ref.__if) createProps(element, parent)

  // apply variants
  applyVariant(element, parent)

  // run `on.init`
  const initReturns = triggerEventOn('init', element, options)
  if (initReturns === false) return element

  // run `on.beforeClassAssign`
  triggerEventOn('beforeClassAssign', element, options)

  // generate a CLASS name
  assignClass(element)

  // CREATE a real NODE
  createNode(element, options)

  if (!__ref.__if) return element

  // assign NODE
  assignNode(element, parent, key)

  // run `on.renderRouter`
  triggerEventOn('renderRouter', element, options)

  // run `on.render`
  triggerEventOn('render', element, options)

  if (parent.__ref && parent.__ref.__children) parent.__ref.__children.push(element.key)

  return element
}

const checkIfPrimitive = (element) => {
  return is(element)('string', 'number')
}

const applyValueAsText = (element, parent, key) => {
  const extendTag = element.extend && element.extend.tag
  const childExtendTag = parent.childExtend && parent.childExtend.tag
  const isKeyValidHTMLTag = ((TAGS.body.indexOf(key) > -1) && key)
  return {
    text: element,
    tag: extendTag || childExtendTag || isKeyValidHTMLTag || 'string'
  }
}

const addMethods = (element, parent) => {
  // assign METHODS
  element.set = set
  element.update = update
  element.remove = remove
  element.updateContent = updateContentElement
  element.removeContent = removeContentElement
  element.setProps = setProps
  element.lookup = lookup
  element.spotByPath = spotByPath
  element.parse = parse
  element.parseDeep = parseDeep
  element.keys = keys
  element.nextElement = nextElement
  element.previousElement = previousElement
  if (ENV === 'test' || ENV === 'development') {
    element.log = log
  }
}

const applyContext = (element, parent, options) => {
  if (options.context && !ROOT.context && !element.context) ROOT.context = options.context
  if (!element.context) element.context = parent.context || options.context || ROOT.context
}

const checkIf = (element, parent) => {
  const { __ref: ref } = element

  if (isFunction(element.if)) {
    // TODO: move as fragment
    const ifPassed = element.if(element, element.state)
    if (!ifPassed) {
      const ifFragment = cacheNode({ tag: 'fragment' })
      ref.__ifFragment = appendNode(ifFragment, parent.node)
      delete ref.__if
    } else ref.__if = true
  } else ref.__if = true
}

const addCaching = (element, parent) => {
  const { __ref: ref } = element
  let { __ref: parentRef } = parent

  // enable TRANSFORM in data
  if (!element.transform) element.transform = {}

  // enable CACHING
  if (!ref.__cached) ref.__cached = {}
  if (!ref.__defineCache) ref.__defineCache = {}

  // enable EXEC
  if (!ref.__exec) ref.__exec = {}

  // enable CLASS CACHING
  if (!ref.__class) ref.__class = {}
  if (!ref.__classNames) ref.__classNames = {}

  // enable CLASS CACHING
  if (!ref.__attr) ref.__attr = {}

  // enable CHANGES storing
  if (!ref.__changes) ref.__changes = []

  // enable CHANGES storing
  if (!ref.__children) ref.__children = []

  // Add _root element property
  const hasRoot = parent && parent.key === ':root'
  if (!ref.__root) ref.__root = hasRoot ? element : parentRef.__root

  // set the PATH array
  if (ENV === 'test' || ENV === 'development') {
    if (!parentRef) parentRef = parent.ref = {}
    if (!parentRef.__path) parentRef.__path = []
    ref.__path = parentRef.__path.concat(element.key)
  }
}

const resolveExtends = (element, parent, options) => {
  const { __ref } = element
  element.tag = detectTag(element)

  if (!__ref.__exec) __ref.__exec = {}
  if (!__ref.__attr) __ref.__attr = {}

  if (!element.props) element.props = {}
  if (!element.state) element.state = {}

  createState(element, parent, { skipApplyMethods: true })
  createProps(element, parent)
  applyVariant(element, parent)

  throughInitialExec(element, options.propsExcludedFromExec)

  for (const param in element) {
    const prop = element[param]
    if (
      isUndefined(prop) ||
      isMethod(param) ||
      isObject(registry[param]) ||
      isVariant(param)
    ) continue

    const hasDefined = element.define && element.define[param]
    const ourParam = registry[param]
    const hasOptionsDefine = options.define && options.define[param]
    if (ourParam && !hasOptionsDefine) continue
    else if (element[param] && !hasDefined && !hasOptionsDefine) {
      create(exec(prop, element), element, param, options)
    }
  }

  delete element.parent
  delete element.update
  delete element.__element

  // added by createProps
  delete element.props.update
  delete element.props.__element

  // added by createState
  delete element.state.__element
  delete element.state.__element
  if (!options.keepRef) delete element.__ref

  return element
}

const checkIfMedia = (key) => key.slice(0, 1) === '@'

const applyMediaProps = (element, parent, key) => {
  const { props } = element
  if (props) {
    props.display = 'none'
    if (props[key]) props[key].display = props.display
    else props[key] = { display: props.display || 'block' }
    return element
  } else {
    return {
      ...element,
      props: {
        display: 'none',
        [key]: { display: 'block' }
      }
    }
  }
}

export default create
