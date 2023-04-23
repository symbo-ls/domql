'use strict'

import { on } from '../event'
import { triggerEventOn } from '@domql/event'
import { is, isObject, exec, isFunction, isUndefined, arrayContainsOtherArray, isObjectLike, isArray, removeFromArray, removeFromObject } from '@domql/utils'
import { deepClone, overwriteShallow, overwriteDeep } from '../utils'
import { create } from '.'

export const IGNORE_STATE_PARAMS = [
  'update', 'parse', 'clean', 'create', 'destroy', 'remove', 'apply', 'rootUpdate',
  'parent', '__element', '__depends', '__ref', '__children', '__root'
]

export const parse = function () {
  const state = this
  if (isObject(state)) {
    const obj = {}
    for (const param in state) {
      if (!IGNORE_STATE_PARAMS.includes(param)) {
        obj[param] = state[param]
      }
    }
    return obj
  } else if (isArray(state)) {
    return state.filter(item => !IGNORE_STATE_PARAMS.includes(item))
  }
}

export const clean = function () {
  const state = this
  for (const param in state) {
    if (!IGNORE_STATE_PARAMS.includes(param)) {
      delete state[param]
    }
  }
  state.update()
  return state
}

export const destroy = function () {
  const state = this
  const element = state.__element
  delete element.state
  element.state = state.parent

  if (state.parent) {
    delete state.parent.__children[element.key]
  }

  if (state.__children) {
    for (const key in state.__children) {
      const child = state.__children[key]
      if (child.state) {
        child.parent = state.parent
      }
    }
  }

  element.state.update()
  return element.state
}

export const rootUpdate = function (obj, options = {}) {
  const state = this
  if (!state) return
  const rootState = (state.__element.__ref.__root).state
  return rootState.update(obj, options)
}

export const update = function (obj, options = {}) {
  const state = this
  const element = state.__element
  const __elementRef = element.__ref
  const parentState = element.parent.state
  state.parent = parentState

  for (const param in state) {
    if (isUndefined(state[param])) {
      delete state[param]
    }
  }

  if (!state.__element) {
    create(element, element.parent)
  }

  if (element.on && isFunction(element.on.initStateUpdated)) {
    const initReturns = on.initStateUpdated(element.on.initStateUpdated, element, state, obj)
    if (initReturns === false) {
      return
    }
  }

  if (options.shallow) {
    overwriteShallow(state, obj, IGNORE_STATE_PARAMS)
  } else {
    overwriteDeep(state, obj, IGNORE_STATE_PARAMS)
  }

  const stateKey = __elementRef.__state
  const shouldPropagateState = stateKey && parentState && parentState[stateKey] && !options.stopStatePropogation
  if (shouldPropagateState) {
    const isStringState = (__elementRef.__stateType === 'string')
    parentState[stateKey] = isStringState ? state.value : state.parse()
    parentState.update({}, options)
    return state
  }

  if (!options.preventUpdate) {
    element.update({}, options)
  } else if (options.preventUpdate === 'recursive') {
    element.update({}, { ...options, preventUpdate: true })
  }

  if (state.__depends) {
    for (const el in state.__depends) {
      const findElement = state.__depends[el]
      findElement.clean().update(state.parse(), options)
    }
  }

  if (element.on && isFunction(element.on.stateUpdated) && !options.preventUpdateListener) {
    on.stateUpdated(element.on.stateUpdated, element, state, obj)
  }

  return state
}

export const remove = function (key, options) {
  const state = this
  if (isArray(state)) removeFromArray(state, key)
  if (isObject(state)) removeFromObject(state, key)
  return state.update({}, options)
}

export const apply = function (func, options) {
  const state = this
  if (isFunction(func)) {
    func(state)
    return state.update({}, options)
  }
}

const getParentStateInKey = (stateKey, parentState) => {
  const arr = stateKey.split('../')
  const arrLength = arr.length - 1
  for (let i = 0; i < arrLength; i++) {
    if (!parentState.parent) return null
    parentState = parentState.parent
  }
  return parentState
}

const getChildStateInKey = (stateKey, parentState) => {
  const arr = stateKey.split('/')
  const arrLength = arr.length - 1
  for (let i = 0; i < arrLength; i++) {
    const childKey = arr[i]
    const grandChildKey = arr[i + 1]
    const childInParent = parentState[childKey]
    if (childInParent && childInParent[grandChildKey]) {
      stateKey = grandChildKey
      parentState = childInParent
    } else return
  }
  return parentState[stateKey]
}

const createInheritedState = function (element, parent) {
  const __elementRef = element.__ref
  let stateKey = __elementRef.__state
  if (!stateKey) return element.state

  let parentState = parent.state
  if (stateKey.includes('../')) {
    parentState = getParentStateInKey(stateKey, parent.state)
    stateKey = stateKey.replaceAll('../', '')
  }
  if (!parentState) return {}

  const keyInParentState = getChildStateInKey(stateKey, parentState)
  if (!keyInParentState) return {}

  if (is(keyInParentState)('object', 'array')) {
    return deepClone(keyInParentState)
  } else if (is(keyInParentState)('string', 'number')) {
    __elementRef.__stateType = 'string'
    return { value: keyInParentState }
  }

  console.warn(stateKey, 'is not present. Replacing with', {})
  return {}
}

export const createState = function (element, parent, opts) {
  const skip = (opts && opts.skip) ? opts.skip : false
  let { state, __ref: __elementRef } = element

  if (isFunction(state)) state = exec(state, element)

  if (is(state)('string', 'number')) {
    __elementRef.__state = state
    state = {}
  }
  if (state === true) {
    __elementRef.__state = element.key
    state = {}
  }

  // trigger `on.stateInit`
  triggerEventOn('stateInit', element)

  state = createInheritedState(element, parent)

  if (!state) {
    if (parent && parent.state) return parent.state
    return {}
  } else {
    __elementRef.__hasRootState = true
  }

  // reference other state
  // TODO: check why __ref is assigned with element
  // /docs/intro
  const { __ref } = state
  if (__ref) {
    state = deepClone(__ref, IGNORE_STATE_PARAMS)
    if (isObject(__ref.__depends)) {
      __ref.__depends[element.key] = state
    } else __ref.__depends = { [element.key]: state }
  } else {
    state = deepClone(state, IGNORE_STATE_PARAMS)
  }

  element.state = state

  // NOTE: Only true when 'onlyResolveExtends' option is set to true
  if (skip) return state

  applyMethods(element, state)

  // trigger `on.stateCreated`
  triggerEventOn('stateCreated', element)

  return state
}

export const isState = function (state) {
  if (!isObjectLike(state)) return false
  const keys = Object.keys(state)
  return arrayContainsOtherArray(keys, ['update', 'parse', 'clean', 'create', 'parent', 'rootUpdate'])
}

const applyMethods = (element, state) => {
  const __elementRef = element.__ref

  state.clean = clean
  state.parse = parse
  state.destroy = destroy
  state.update = update
  state.rootUpdate = rootUpdate
  state.create = createState
  state.remove = remove
  state.apply = apply
  state.parent = element.parent.state
  state.__element = element
  state.__children = {}
  state.__root = __elementRef.__root ? __elementRef.__root.state : state

  if (state.parent) state.parent.__children[element.key] = state
}

export default createState
