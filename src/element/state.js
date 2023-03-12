'use strict'

import { on } from '../event'
import { triggerEventOn } from '@domql/event'
import { is, isObject, exec, isFunction, isUndefined } from '@domql/utils'
import { deepClone, overwriteShallow, overwriteDeep } from '../utils'

export const IGNORE_STATE_PARAMS = [
  'update', 'parse', 'clean', 'create', 'parent', '__element', '__depends', '__ref', '__root',
  '__components',
  '__projectDesignSystem', '__projectState', '__projectComponents', '__projectPages', '__projectSnippets',
  'projectStateUpdate', 'projectSystemUpdate'
]

export const parseState = function () {
  const state = this
  const parseState = {}
  for (const param in state) {
    if (!IGNORE_STATE_PARAMS.includes(param)) {
      parseState[param] = state[param]
    }
  }
  return parseState
}

export const cleanState = function () {
  const state = this
  for (const param in state) {
    if (!IGNORE_STATE_PARAMS.includes(param)) {
      delete state[param]
    }
  }
  return state
}

export const projectSystemUpdate = function (obj, options = {}) {
  const state = this
  if (!state) return
  const rootState = (state.__element.__ref.__root || state.__element).state
  rootState.update({ PROJECT_DESIGN_SYSTEM: obj }, options)
  return state
}

export const projectStateUpdate = function (obj, options = {}) {
  const state = this
  if (!state) return
  const rootState = (state.__element.__ref.__root || state.__element).state
  rootState.update({ PROJECT_STATE: obj }, options)
  return state
}

export const updateState = function (obj, options = {}) {
  const state = this
  const element = state.__element
  const __elementRef = element.__ref
  state.parent = element.parent.state

  if (!state.__element) createState(element, element.parent)

  // run `on.stateUpdated`
  if (element.on && isFunction(element.on.initStateUpdated)) {
    const initReturns = on.initStateUpdated(element.on.initStateUpdated, element, state, obj)
    if (initReturns === false) return
  }

  const stateKey = __elementRef.__state
  if (stateKey) {
    // TODO: check for double parent
    if (state.parent && state.parent[stateKey]) {
      const keyInParentState = state.parent[stateKey]
      if (keyInParentState && !options.stopStatePropogation) {
        if (__elementRef.__stateType === 'string') {
          return state.parent.update({ [stateKey]: obj.value }, options)
        }
        return state.parent.update({ [stateKey]: obj }, options)
      }
    }
  } else {
    if (options && options.shallow) {
      overwriteShallow(state, obj, IGNORE_STATE_PARAMS)
    } else {
      overwriteDeep(state, obj, IGNORE_STATE_PARAMS)
    }
  }

  // TODO: try debounce
  if (!options.preventUpdate) { element.update({}, options) } else if (options.preventUpdate === 'recursive') { element.update({}, { ...options, preventUpdate: true }) }

  if (state.__depends) {
    for (const el in state.__depends) {
      const findElement = state.__depends[el]
      findElement.clean().update(state.parse(), options)
    }
  }

  if (!options.preventUpdateListener && element.on && isFunction(element.on.stateUpdated)) {
    on.stateUpdated(element.on.stateUpdated, element, state, obj)
  }
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

  if (!state) {
    if (parent && parent.state) return parent.state
    return {}
  } else {
    __elementRef.__hasRootState = true
  }

  // trigger `on.stateInit`
  triggerEventOn('stateInit', element)

  let stateKey = __elementRef.__state
  if (stateKey) {
    let parentState = parent.state
    const parentKeysArr = stateKey.split('../')
    for (let i = 1; i < parentKeysArr.length; i++) {
      stateKey = parentKeysArr[i]
      parentState = parentState.parent
    }
    const childrenKeysArr = stateKey.split('.')
    for (let i = 0; i < childrenKeysArr.length; i++) {
      const childKey = childrenKeysArr[i]
      const grandChildKey = childrenKeysArr[i + 1]
      const childInParent = parentState[childKey]
      if (childInParent && childInParent[grandChildKey]) {
        stateKey = grandChildKey
        parentState = childInParent
      }
    }
    if (parentState && parentState[stateKey]) {
      const keyInParentState = parentState[stateKey]
      if (is(keyInParentState)('object', 'array')) {
        state = deepClone(keyInParentState)
      } else if (is(keyInParentState)('string', 'number')) {
        state = { value: keyInParentState }
        __elementRef.__stateType = 'string'
      } else if (isUndefined(keyInParentState)) {
        console.warn(stateKey, 'is not in present', 'replacing with ', {})
        state = {}
      }
    }
  }

  // reference other state
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

  state.clean = cleanState
  state.parse = parseState
  state.update = updateState
  state.create = createState
  state.parent = element.parent.state
  state.__element = element
  state.__root = __elementRef.__root ? __elementRef.__root.state : state

  // editor stuff
  state.projectSystemUpdate = projectSystemUpdate
  state.projectStateUpdate = projectStateUpdate
  state.__components = state.__root.COMPONENTS
  state.__projectDesignSystem = state.__root.PROJECT_DESIGN_SYSTEM
  state.__projectState = state.__root.PROJECT_STATE
  state.__projectComponents = state.__root.PROJECT_COMPONENTS
  state.__projectPages = state.__root.PROJECT_PAGES
  state.__projectSnippets = state.__root.PROJECT_SNIPPETS

  // trigger `on.stateCreated`
  triggerEventOn('stateCreated', element)

  return state
}

export default createState
