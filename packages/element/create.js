'use strict'

import createNode from './node'
import { ROOT } from './tree'
import { TAGS } from '@domql/registry'
import { triggerEventOn } from '@domql/event'
import { appendNode, assignNode } from '@domql/render'
import { cacheNode, detectTag } from '@domql/node'
import { createState } from '@domql/state'

import { isMethod } from './methods'
import { createProps } from './props'
import { applyExtend } from './extend'
import { registry } from './mixins'
import { addMethods } from './methods/set'
import { assignKeyAsClassname } from './mixins/classList'
import { throughInitialExec } from './iterate'

import {
  isObject,
  isFunction,
  isString,
  exec,
  is,
  isNode,
  isUndefined,
  generateKey
} from '@domql/utils'

import OPTIONS from './cache/options'

import {
  applyComponentFromContext,
  applyKeyComponentAsExtend,
  applyVariant,
  checkIfKeyIsComponent,
  isVariant
} from './utils/component'

const ENV = process.env.NODE_ENV

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key, options = OPTIONS.create || {}) => {
  cacheOptions(element, options)

  // if element is STRING
  if (checkIfPrimitive(element)) {
    return applyValueAsText(element, parent, key)
  }

  element = redefineElement(element, parent, key, options)
  parent = redefineParent(element, parent, key)
  key = createKey(element, parent, key)

  const ref = addRef(element, parent, key)

  // assign context
  applyContext(element, parent, options)

  applyComponentFromContext(element, parent, options)

  // create EXTEND inheritance
  applyExtend(element, parent, options)

  // create and assign a KEY
  element.key = key

  // Only resolve extends, skip everything else
  if (options.onlyResolveExtends) {
    return onlyResolveExtends(element, parent, options)
  }

  replaceOptions(element, parent, options)

  addCaching(element, parent)

  addMethods(element, parent)

  createState(element, parent)

  createIfConditionFlag(element, parent)

  // if it already HAS a NODE
  if (element.node && ref.__if) {
    return assignNode(element, parent, key)
  }

  // apply props settings
  createProps(element, parent)

  // apply variants
  applyVariant(element, parent)

  const onInit = triggerEventOn('init', element, options)
  if (onInit === false) return element

  triggerEventOn('beforeClassAssign', element, options)

  // generate a CLASS name
  assignKeyAsClassname(element)

  renderElement(element, parent, options)

  addElementIntoParentChildren(element, parent)

  triggerEventOn('complete', element, options)

  return element
}

const createBasedOnType = (element, parent, key, options) => {
  // if ELEMENT is not given
  if (element === undefined) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'element is undefined in', parent && parent.__ref && parent.__ref.path)
    }
    return {}
  }
  if (isString(key) && key.slice(0, 2 === '__')) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'seems like to be in __ref')
    }
  }
  if (element === null) return
  if (element === true) return { text: true }

  // if element is extend
  if (element.__hash) {
    return { extend: element }
  }

  return element
}

const redefineElement = (element, parent, key, options) => {
  const elementWrapper = createBasedOnType(element, parent, key, options)

  if (checkIfKeyIsComponent(key)) {
    return applyKeyComponentAsExtend(elementWrapper, parent, key)
  }

  // TODO: move as define plugins
  // Responsive rendering
  if (checkIfMedia(key)) {
    return applyMediaProps(elementWrapper, parent, key)
  }

  return elementWrapper
}

const redefineParent = (element, parent, key, options) => {
  if (!parent) return ROOT
  if (isNode(parent)) {
    const parentNodeWrapper = { key: ':root', node: parent }
    ROOT[`${key}_parent`] = parentNodeWrapper
    return parentNodeWrapper
  }
  return parent
}

const cacheOptions = (element, options) => {
  if (options && !OPTIONS.create) {
    OPTIONS.create = options
    OPTIONS.create.context = element.context || options.context
  }
}

const createKey = (element, parent, key) => {
  return (
    key ||
    element.key ||
    generateKey()
  ).toString()
}

const addRef = (element, parent) => {
  if (element.__ref) element.__ref.origin = element
  else element.__ref = { origin: element }
  return element.__ref
}

const replaceOptions = (element, parent, options) => {
  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildExtend) delete options.ignoreChildExtend
  }
}

const addElementIntoParentChildren = (element, parent) => {
  if (parent.__ref && parent.__ref.__children) parent.__ref.__children.push(element.key)
}

const renderElement = (element, parent, options) => {
  const { __ref: ref, key } = element

  // CREATE a real NODE
  createNode(element, options)

  if (!ref.__if) return element

  // assign NODE
  assignNode(element, parent, key)

  // run `on.renderRouter`
  triggerEventOn('renderRouter', element, options)

  // run `on.render`
  triggerEventOn('render', element, options)
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

const applyContext = (element, parent, options) => {
  if (options.context && !ROOT.context && !element.context) ROOT.context = options.context
  if (!element.context) element.context = parent.context || options.context || ROOT.context
}

const createIfConditionFlag = (element, parent) => {
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

const onlyResolveExtends = (element, parent, options) => {
  const { __ref } = element
  element.tag = detectTag(element)

  if (!__ref.__exec) __ref.__exec = {}
  if (!__ref.__attr) __ref.__attr = {}

  if (!element.props) element.props = {}
  if (!element.state) element.state = element.parent.state || {}

  createState(element, parent, { skipApplyMethods: true, ...options })
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

    const hasDefine = element.define && element.define[param]
    const contextHasDefine = element.context && element.context.define &&
          element.context.define[param]
    const optionsHasDefine = options.define && options.define[param]

    if (registry[param] && !optionsHasDefine) {
      continue
    } else if (element[param] && !hasDefine && !optionsHasDefine && !contextHasDefine) {
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
