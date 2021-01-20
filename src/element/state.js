'use strict'

import { deepClone, exec, isFunction, overwriteDeep } from '../utils'

export const parseState = function () {
  const state = this
  const parseState = {}
  for (const param in state) {
    if (param !== '__element' && param !== 'update' && param !== 'parse') {
      parseState[param] = state[param]
    }
  }
  return parseState
}

export const updateState = function (obj) {
  const state = this
  overwriteDeep(state, obj, ['update', 'parse', '__element'])
  this.__element.update()
}

export default function (element) {
  let { state } = element
  if (!state) return element.parent.state || {}
  if (isFunction(state)) state = exec(state, element)

  state = deepClone(state)
  state.__element = element
  state.update = updateState
  state.parse = parseState

  return state
}
