'use strict'

import { root } from '@domql/tree'
import { createId } from '@domql/id'
import { isNumber, isString, isObject, isNode, isFunction, isArray } from '@domql/utils'
import { DEFAULT_METHODS } from '@domql/registry'
import { createState } from '@domql/state'
import { createProps } from '@domql/props'

const OPTIONS = {}

const init = (element, key) => {
  const ref = {}
  if (isObject(element)) {
    if (!element.ref) element.ref = {}
    if (element.on && element.on.init) element.on.init(element, element.state)
    return element
  }
  if (isString(element) || isNumber(element)) return {
    key,
    ref,
    props: { value: element  }
  }
  if (isArray(element)) Object.assign({}, element)
  if (!element) return { ref }
  return element
}

const assignKey = (element, key) => {
  if (element.key) return element
  element.key = key || createId.next().value
  return element
}

const applyTag = (element, key) => {
  if (element.tag) return element
  const keyIsTag = NODE_REGISTRY.body.indexOf(key) > -1
  element.tag = keyIsTag ? key : 'div'
  return element
}

const applyParent = (element, key) => {
  const { ref } = element
  console.log(element)
  const { parent } = ref
  if (isNode(parent)) {
    ref.parent = root.ref[`parent`] = { node: parent }
  }
  if (!parent) ref.parent = root
  return element
}

const applyState = (element, key) => {
  const { ref, state } = element
  ref.state = createState(element, element.ref.parent)
  return element
}

const applyExtends = (element, key) => {
  return element
}

const applyProps = (element, key) => {
  const { ref, props } = element
  ref.props = createProps(element, element.ref.parent)
  return element
}

const onEachAvailable = (element, key, options) => {
  const { ref } = element
  const value = element[key]
  let { children } = ref
  if (!children) children = ref.children = []

  // add to ref.children
  const useOption = OPTIONS[onEachAvailable]
  if (useOption) useOption(element, key)

  // move value to ref.children
  children.push({key, ...value})

  // create children
  create(value, element, key, options)
}

const onEach = (element, key, options) => {
  for (const key in element) {
    const isMethod = DEFAULT_METHODS[key]
    if (isMethod && isFunction(isMethod)) isMethod(element, element.state)
    if (!isMethod) onEachAvailable(element, key, options)
  }
  return element
}

const applyTransform = (element, key, options) => {
  const { ref, transform } = element
  if (!ref.transform) ref.transform = {}
  const defaultTransforms = options.transform
  if (!transform && !defaultTransforms) return element
  const transformKeys = Object.keys(transform || {})
  const defaultTransformKeys = Object.keys(defaultTransforms || {})
  const keys = transformKeys.concat(defaultTransformKeys)
  keys.map(key => {
    const transformer = (transform || defaultTransforms)[key]
    ref.transform[key] = transformer(element, key)
  })
  return element
}

/**
 * Creating a DOMQL element
 */
export const create = (element, parent, key, options = OPTIONS) => {
  [
    init,
    assignKey,
    applyParent,
    applyState,
    applyExtends,
    applyProps,
    onEach,
    applyTransform
  ].reduce((prev, current) => current(prev, key, options), element)

  console.log(element)
  return element
}

const transformReact = (element, key) => {
  const { ref } = element
  const { tag, props, children: ch, ...rest } = ref
  const children = isArray(ch) && ch.map(child => transformReact(child, key))
  return {
    type: tag,
    props,
    children
  }
}

create({
  test: {
    test2: {}
  }
}, null, null, {
  transform: {
    react: transformReact
  }
})