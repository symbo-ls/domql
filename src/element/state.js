'use strict'

import { on } from '../event'
import { deepClone, exec, overwriteDeep } from '../utils'
import { is, isObject, isFunction } from '@domql/utils'

export const IGNORE_STATE_PARAMS = [
  'update', 'parse', 'clean', 'parent', '__element', '__depends', '__ref', '__root',
  '__components', '__projectSystem', '__projectState', '__projectLibrary',
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
  const rootState = (state.__element.__root || state.__element).state
  rootState.update({ PROJECT_SYSTEM: obj }, options)
  return state
}

export const projectStateUpdate = function (obj, options = {}) {
  const state = this
  if (!state) return
  const rootState = (state.__element.__root || state.__element).state
  rootState.update({ PROJECT_STATE: obj }, options)
  return state
}

export const updateState = function (obj, options = {}) {
  const state = this
  const element = state.__element

  // run `on.stateUpdated`
  if (element.on && isFunction(element.on.initStateUpdated)) {
    const initReturns = on.initStateUpdated(element.on.initStateUpdated, element, state, obj)
    if (initReturns === false) return
  }

  if (element.__state) {
    if (state.parent && state.parent[element.__state]) {
      const keyInParentState = state.parent[element.__state]
      if (keyInParentState && !options.stopStatePropogation) {
        return state.parent.update({ [element.__state]: obj }, options)
      }
    }
  } else {
    overwriteDeep(state, obj, IGNORE_STATE_PARAMS)
  }

  // TODO: try debounce
  if (!options.preventUpdate || options.preventUpdate === 'recursive') element.update({}, { ...options, preventUpdate: true })

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

export default function (element, parent) {
  let { state, __root } = element

  if (isFunction(state)) state = exec(state, element)

  if (is(state)('string', 'number')) {
    element.__state = state
    state = {}
  }
  if (state === true) {
    element.__state = element.key
    state = {}
  }

  if (!state) {
    if (parent && parent.state) return parent.state
    return {}
  } else {
    element.__hasRootState = true
  }

  // run `on.init`
  if (element.on && isFunction(element.on.stateInit)) {
    on.stateInit(element.on.stateInit, element, element.state)
  }

  let stateKey = element.__state
  if (stateKey) {
    let parentState = parent.state
    let parentStateKey
    if (stateKey.includes('..')) {
      stateKey = stateKey.split('../')[1]
      parentState = parent.state.parent
    }
    if (stateKey.includes('.')) {
      [parentStateKey, stateKey] = stateKey.split('.')
      parentState = parentState[parentStateKey]
    }
    if (parentState && parentState[stateKey]) {
      const keyInParentState = parentState[stateKey]
      if (is(keyInParentState)('object', 'array')) {
        state = deepClone(keyInParentState)
      } else if (is(keyInParentState)('string', 'number')) {
        state = { value: keyInParentState }
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
  state.clean = cleanState
  state.parse = parseState
  state.update = updateState
  state.parent = element.parent.state
  state.__element = element
  state.__root = __root ? __root.state : state

  // editor stuff
  state.projectSystemUpdate = projectSystemUpdate
  state.projectStateUpdate = projectStateUpdate
  state.__components = (state.__root || state).COMPONENTS
  state.__projectSystem = (state.__root || state).PROJECT_SYSTEM
  state.__projectState = (state.__root || state).PROJECT_STATE
  state.__projectLibrary = (state.__root || state).PROJECT_LIBRARY

  // run `on.stateCreated`
  if (element.on && isFunction(element.on.stateCreated)) {
    on.stateCreated(element.on.stateCreated, element, state)
  }

  return state
}
