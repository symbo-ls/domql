'use strict'

import { isArray } from "@domql/utils"

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
  state.update(state, { skipOverwrite: true, options })
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
    state.update(state.parse(), { skipOverwrite: true, ...options })
  }
}

export const toggle = function (key, options = {}) {
  const state = this
  state[key] = !state[key]
  state.update({ [key]: !state[key] }, { skipOverwrite: true, ...options })
}

export const remove = function (key, options = {}) {
  const state = this
  if (isArray(state)) removeFromArray(state, key)
  if (isObject(state)) removeFromObject(state, key)
  return state.update(state.parse(), { skipOverwrite: true, ...options })
}

export const apply = function (func, options = {}) {
  const state = this
  if (isFunction(func)) {
    func(state)
    return state.update(state, { skipOverwrite: true, ...options })
  }
}
