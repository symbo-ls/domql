'use strict'

import { on } from '../event'
import { debounce, deepClone, exec, isFunction, isObject, overwriteDeep } from '../utils'

export const IGNORE_STATE_PARAMS = ['update', 'parse', 'clean', 'parent', 'systemUpdate', '__system', '__element', '__depends', '__ref']

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

export const systemUpdate = function (obj, options = {}) {
  const state = this
  const rootState = state.__element.__root.state
  rootState.update({ SYSTEM: obj }, options)
  return state
}

export const updateState = function (obj, options = {}) {
  const state = this
  const element = state.__element

  // run `on.stateUpdated`
  if (element.on && isFunction(element.on.initStateUpdated)) {
    on.initStateUpdated(element.on.initStateUpdated, element, state)
  }

  overwriteDeep(state, obj, IGNORE_STATE_PARAMS)

  if (!options.preventUpdate) element.update({}, options)

  // debounce(element, , 150)({}, {
  //   // preventStateUpdate: 'once',
  //   ...options
  // })

  if (state.__depends) {
    for (const el in state.__depends) {
      // const findElement = element.spotByPath(state.__depends[el])
      const findElement = state.__depends[el]
      findElement.clean().update(state.parse(), options)
    }
  }

  // run `on.stateUpdated`
  if (!options.preventUpdateListener && element.on && isFunction(element.on.stateUpdated)) {
    on.stateUpdated(element.on.stateUpdated, element, state, obj)
  }
}

export default function (element, parent) {
  let { state, __root } = element

  if (!state) {
    if (parent && parent.state) return parent.state
    return {}
  }

  if (isFunction(state)) state = exec(state, element)

  const { __ref } = state
  if (__ref) {
    state = deepClone(__ref, IGNORE_STATE_PARAMS)
    if (isObject(__ref.__depends)) {
      __ref.__depends[element.key] = state
    } else __ref.__depends = { [element.key] : state }
  } else {
    state = deepClone(state, IGNORE_STATE_PARAMS)
  }

  element.state = state
  state.__element = element
  state.clean = cleanState
  state.parse = parseState
  state.update = updateState
  state.systemUpdate = systemUpdate
  state.parent = element.parent.state
  state.__system = __root && __root.state && __root.state.SYSTEM || state.SYSTEM

  // run `on.stateCreated`
  if (element.on && isFunction(element.on.stateCreated)) {
    on.stateCreated(element.on.stateCreated, element, state)
  }

  return state
}
