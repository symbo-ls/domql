'use strict'

import { isArray, isFunction, isObject, removeFromArray, removeFromObject } from '@domql/utils'

import { IGNORE_STATE_PARAMS } from './ignore'

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

export const clean = function (options = {}) {
  const state = this
  for (const param in state) {
    if (!IGNORE_STATE_PARAMS.includes(param)) {
      delete state[param]
    }
  }
  if (!options.preventStateUpdate) {
    state.update(state, { replace: true, skipOverwrite: true, options })
  }
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

export const add = function (value, options = {}) {
  const state = this
  if (isArray(state)) {
    state.push(value)
    state.update(state.parse(), { replace: true, ...options })
  } else if (isObject(state)) {
    const key = Object.keys(state).length
    state.update({ [key]: value }, options)
  }
}

export const toggle = function (key, options = {}) {
  const state = this
  state.update({ [key]: !state[key] }, options)
}

export const remove = function (key, options = {}) {
  const state = this
  console.log(state)
  if (isArray(state)) removeFromArray(state, key)
  if (isObject(state)) removeFromObject(state, key)
  return state.update(state.parse(), { replace: true, ...options })
}

export const set = function (value, options = {}) {
  const state = this
  state.clean({ preventStateUpdate: true })
  return state.update(value, { replace: true, ...options })
}

export const apply = function (func, options = {}) {
  const state = this
  if (isFunction(func)) {
    func(state)
    return state.update(state, { replace: true, ...options })
  }
}
