'use strict'

import { createNode } from './node.js'
import { ROOT } from './tree.js'

import {
  isObject,
  isFunction,
  exec,
  isNode,
  isUndefined,
  deepClone,
  applyComponentFromContext,
  applyKeyComponentAsExtend,
  isVariant,
  detectInfiniteLoop,
  redefineProperties,
  createBasedOnType,
  addCaching,
  createKey,
  addRef
} from '@domql/utils'

import { applyAnimationFrame, triggerEventOn } from '@domql/event'
import { assignNode } from '@domql/render'
import { createState } from '@domql/state'

import { isMethod } from './methods/index.js'
import { createProps } from './props/index.js'
import { applyExtend } from './extend.js'
import { REGISTRY, registry } from './mixins/index.js'
import { addMethods } from './methods/set.js'
import { assignKeyAsClassname } from './mixins/classList.js'
import { throughInitialExec, throughInitialDefine } from './iterate.js'

import { OPTIONS } from './cache/options.js'

const ENV = process.env.NODE_ENV

/**
 * Creating a DOMQL element using passed parameters
 */
export const create = async (
  element,
  parent,
  key,
  options = OPTIONS.create || {},
  attachOptions
) => {
  cacheOptions(element, options)

  element = redefineElement(element, parent, key)
  parent = redefineParent(element, parent, key)
  key = createKey(element, parent, key)

  const ref = addRef(element, parent, key)

  ref.__initialProps = deepClone(element.props)

  applyContext(element, parent, options)

  applyComponentFromContext(element, parent, options)

  if (!ref.__skipCreate) {
    applyExtend(element, parent, options)
  }

  redefineProperties(element, parent)

  element.key = key

  await triggerEventOn('start', element, options)

  if (options.onlyResolveExtends) {
    return onlyResolveExtends(element, parent, key, options)
  }

  switchDefaultOptions(element, parent, options)

  addCaching(element, parent)

  addMethods(element, parent, options)

  createScope(element, parent)

  await createState(element, parent)
  if (element.scope === 'state') element.scope = element.state

  createIfConditionFlag(element, parent)

  // apply props settings
  createProps(element, parent, options)
  if (element.scope === 'props' || element.scope === true) {
    element.scope = element.props
  }

  // recatch if it passess props again
  createIfConditionFlag(element, parent)

  // if it already HAS a NODE
  if (element.node && ref.__if) {
    return assignNode(element, parent, key, attachOptions)
  }

  // apply variants
  // applyVariant(element, parent)

  const onInit = await triggerEventOn('init', element, options)
  if (onInit === false) return element

  triggerEventOn('beforeClassAssign', element, options)

  // generate a CLASS name
  assignKeyAsClassname(element)

  await renderElement(element, parent, options, attachOptions)

  addElementIntoParentChildren(element, parent)

  await triggerEventOn('complete', element, options)

  return element
}

const redefineElement = (element, parent, key) => {
  const elementWrapper = createBasedOnType(element, parent, key)
  return applyKeyComponentAsExtend(elementWrapper, parent, key)
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

const switchDefaultOptions = (element, parent, options) => {
  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildExtends) delete options.ignoreChildExtends
  }
}

const addElementIntoParentChildren = (element, parent) => {
  if (parent.__ref && parent.__ref.__children) {
    parent.__ref.__children.push(element.key)
  }
}

const visitedElements = new WeakMap()
const renderElement = async (element, parent, options, attachOptions) => {
  if (visitedElements.has(element)) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn('Cyclic rendering detected:', element.__ref.path)
    }
  }

  visitedElements.set(element, true)

  const { __ref: ref, key } = element

  const createNestedChild = async () => {
    const isInfiniteLoopDetected = detectInfiniteLoop(ref.path)
    if (ref.__uniqId || isInfiniteLoopDetected) return
    // console.log(element)
    await createNode(element, options)
    ref.__uniqId = Math.random()
  }

  // CREATE a real NODE
  if (ENV === 'test' || ENV === 'development') {
    await createNestedChild()
  } else {
    try {
      await createNestedChild()
    } catch (e) {
      const path = ref.path
      if (path.includes('ComponentsGrid')) {
        path.splice(0, path.indexOf('ComponentsGrid') + 2)
      }
      if (path.includes('demoComponent')) {
        path.splice(0, path.indexOf('demoComponent') + 1)
      }
      const isDemoComponent = element.lookup(el => el.state.key)?.state?.key
      element.warn(
        'Error happened in:',
        isDemoComponent ? isDemoComponent + ' ' : '' + path.join('.')
      )
      element.verbose()
      element.error(e, options)
      if (element.on?.error) {
        element.on.error(e, element, element.state, element.context, options)
      }
      if (element.props?.onError) {
        element.props.onError(
          e,
          element,
          element.state,
          element.context,
          options
        )
      }
    }
  }

  if (!ref.__if) {
    parent[key || element.key] = element
    return element
  }

  // assign NODE
  assignNode(element, parent, key, attachOptions)

  // apply events
  applyAnimationFrame(element, options)

  // run `on.render`
  await triggerEventOn('render', element, options)
  // triggerEventOn('render', element, options).then(() => {})

  // run `on.renderRouter`
  await triggerEventOn('renderRouter', element, options)

  // run `on.done`
  await triggerEventOn('done', element, options)

  // run `on.done`
  await triggerEventOn('create', element, options)
}

const applyContext = (element, parent, options) => {
  const forcedOptionsContext =
    options.context && !ROOT.context && !element.context
  if (forcedOptionsContext) ROOT.context = options.context

  // inherit from parent or root
  if (!element.context) {
    element.context = parent.context || options.context || ROOT.context
  }
}

// Create scope - shared object across the elements to the own or the nearest parent
const createScope = (element, parent) => {
  const { __ref: ref } = element
  // If the element doesn't have a scope, initialize it using the parent's scope or the root's scope.
  if (!element.scope) element.scope = parent.scope || ref.root.scope || {}
}

const createIfConditionFlag = (element, parent) => {
  const { __ref: ref } = element

  if (
    isFunction(element.if) &&
    !element.if(element, element.state, element.context)
  ) {
    delete ref.__if
  } else ref.__if = true
}

const onlyResolveExtends = (element, parent, key, options) => {
  const { __ref: ref } = element
  if (!ref.__skipCreate) {
    addCaching(element, parent)

    addMethods(element, parent, options)

    createScope(element, parent)

    createState(element, parent)
    if (element.scope === 'state') element.scope = element.state

    createIfConditionFlag(element, parent)

    // apply props settings
    createProps(element, parent, options)
    if (element.scope === 'props' || element.scope === true) {
      element.scope = element.props
    }

    if (element.node && ref.__if) {
      parent[key || element.key] = element
    } // Borrowed from assignNode()

    if (!element.props) element.props = {}
    // applyVariant(element, parent)

    addElementIntoParentChildren(element, parent)
  }

  if (element.tag !== 'string' && element.tag !== 'fragment') {
    throughInitialDefine(element)
    throughInitialExec(element)

    for (const k in element) {
      if (
        isUndefined(element[k]) ||
        isMethod(k, element) ||
        isObject((registry.default || registry)[k]) ||
        isVariant(k)
      ) {
        continue
      }

      const hasDefine = element.define && element.define[k]
      const contextHasDefine =
        element.context && element.context.define && element.context.define[k]
      const optionsHasDefine = options.define && options.define[k]

      if (!ref.__skipCreate && REGISTRY[k] && !optionsHasDefine) {
        continue
      } else if (
        element[k] &&
        !hasDefine &&
        !optionsHasDefine &&
        !contextHasDefine
      ) {
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

// const checkIfMedia = (key) => key.slice(0, 1) === '@'

// const applyMediaProps = (element, parent, key) => {
//   const { props } = element
//   if (props) {
//     props.display = 'none'
//     if (props[key]) props[key].display = props.display
//     else props[key] = { display: props.display || 'block' }
//     return element
//   } else {
//     return {
//       ...element,
//       props: {
//         display: 'none',
//         [key]: { display: 'block' }
//       }
//     }
//   }
// }

export default create
