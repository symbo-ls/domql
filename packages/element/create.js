'use strict'

import createNode from './node'
import { ROOT } from './tree'
import { TAGS } from '@domql/registry'
import { triggerEventOn } from '@domql/event'
import { assignNode, detectTag } from '@domql/render'
import { createState } from '@domql/state'

import { isMethod } from './methods'
import { createProps } from './props'
import { applyExtend } from './extend'
import { registry } from './mixins'
import { addMethods } from './methods/set'
import { assignKeyAsClassname } from './mixins/classList'
import { throughInitialExec, throughInitialDefine } from './iterate'

import {
  isObject,
  isFunction,
  isString,
  exec,
  is,
  isNode,
  isUndefined,
  generateKey,
  deepClone
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
const create = (element, parent, key, options = OPTIONS.create || {}, attachOptions) => {
  cacheOptions(element, options)

  // if (key === 'Title') debugger

  // if element is STRING
  if (checkIfPrimitive(element)) {
    element = applyValueAsText(element, parent, key)
  }

  element = redefineElement(element, parent, key, options)
  parent = redefineParent(element, parent, key)
  key = createKey(element, parent, key)

  const ref = addRef(element, parent, key)

  // assign initial props
  ref.__initialProps = deepClone(element.props, [])

  // assign context
  applyContext(element, parent, options)

  applyComponentFromContext(element, parent, options)

  if (!ref.__skipCreate) {
    // create EXTEND inheritance
    applyExtend(element, parent, options)
  }

  // create and assign a KEY
  element.key = key

  // Only resolve extends, skip everything else
  if (options.onlyResolveExtends) {
    return onlyResolveExtends(element, parent, key, options)
  }

  switchDefaultOptions(element, parent, options)

  addCaching(element, parent)

  addMethods(element, parent)

  createScope(element, parent)

  createState(element, parent)
  if (element.scope === 'state') element.scope = element.state

  createIfConditionFlag(element, parent)

  // apply props settings
  createProps(element, parent)
  if (element.scope === 'props' || element.scope === true) element.scope = element.props

  // recatch if it passess props again
  createIfConditionFlag(element, parent)

  // if it already HAS a NODE
  if (element.node && ref.__if) {
    return assignNode(element, parent, key, attachOptions)
  }

  // apply variants
  applyVariant(element, parent)

  const onInit = triggerEventOn('init', element, options)
  if (onInit === false) return element

  triggerEventOn('beforeClassAssign', element, options)

  // generate a CLASS name
  assignKeyAsClassname(element)

  renderElement(element, parent, options, attachOptions)

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
    exec(key, element) ||
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

const switchDefaultOptions = (element, parent, options) => {
  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildExtend) delete options.ignoreChildExtend
  }
}

const addElementIntoParentChildren = (element, parent) => {
  if (parent.__ref && parent.__ref.__children) parent.__ref.__children.push(element.key)
}

const renderElement = (element, parent, options, attachOptions) => {
  const { __ref: ref, key } = element

  // CREATE a real NODE
  createNode(element, options)

  if (!ref.__if) {
    parent[key || element.key] = element
    return element
  }

  // assign NODE
  assignNode(element, parent, key, attachOptions)

  // run `on.renderRouter`
  triggerEventOn('renderRouter', element, options)

  // run `on.render`
  triggerEventOn('render', element, options)
}

const checkIfPrimitive = (element) => is(element)('string', 'number')

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
  const forcedOptionsContext = options.context && !ROOT.context && !element.context
  if (forcedOptionsContext) ROOT.context = options.context

  // inherit from parent or root
  if (!element.context) element.context = parent.context || options.context || ROOT.context
}

// Create scope - shared object across the elements to the own or the nearest parent
const createScope = (element, parent) => {
  const { __ref: ref } = element
  // If the element doesn't have a scope, initialize it using the parent's scope or the root's scope.
  if (!element.scope) element.scope = parent.scope || ref.__root.scope || {}
}

const createIfConditionFlag = (element, parent) => {
  const { __ref: ref } = element

  if (isFunction(element.if) && !element.if(element, element.state)) {
    delete ref.__if
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

const onlyResolveExtends = (element, parent, key, options) => {
  const { __ref: ref } = element
  if (!ref.__skipCreate) {
    element.tag = detectTag(element)

    // if (!element.props) element.props = {}

    // Copy-paste of addCaching()
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

    // Add __root element property
    // const hasRoot = parent && parent.key === ':root'
    // if (!ref.__root) ref.__root = hasRoot ? element : parentRef.__root

    addMethods(element, parent)

    createState(element, parent)

    // Borrowed from createIfConditionFlag()
    if (isFunction(element.if)) {
      const ifPassed = element.if(element, element.state)
      if (!ifPassed) {
        // const ifFragment = cacheNode({ tag: 'fragment' })
        // ref.__ifFragment = appendNode(ifFragment, parent.node)
        delete ref.__if
      } else ref.__if = true
    } else ref.__if = true
    /// ///

    if (element.node && ref.__if) { parent[key || element.key] = element } // Borrowed from assignNode()

    createProps(element, parent)
    if (!element.props) element.props = {}
    applyVariant(element, parent)
  }

  if (element.tag !== 'string' && element.tag !== 'fragment') {
    throughInitialDefine(element)
    throughInitialExec(element)

    for (const k in element) {
      if (
        isUndefined(element[k]) ||
        isMethod(k) ||
        isObject(registry[k]) ||
        isVariant(k)
      ) continue

      const hasDefine = element.define && element.define[k]
      const contextHasDefine = element.context && element.context.define &&
            element.context.define[k]
      const optionsHasDefine = options.define && options.define[k]

      if (!ref.__skipCreate && registry[k] && !optionsHasDefine) {
        continue
      } else if (element[k] && !hasDefine && !optionsHasDefine && !contextHasDefine) {
        create(exec(element[k], element), element, k, options)
      }
    }
  }

  parent[key || element.key] = element // Borrowed from assignNode()

  delete element.update
  delete element.__element

  // added by createProps
  if (element.props) {
    delete element.props.update
    delete element.props.__element
  }

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
