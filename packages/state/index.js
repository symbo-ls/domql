'use strict'

import { on } from '@domql/event'
import { deepClone, diff, exec, isFunction, overwriteDeep } from '@domql/utils'

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

export const updateState = function (obj, options = {}) {
  const state = this
  const element = state.__element

  const changes = diff(obj, state)

  on.updateStateInit(changes, element)

  overwriteDeep(changes, state)
  if (!options.preventUpdate) element.update()

  on.updateState(changes, state, element)
}

export function createState (element, parent) {
  let { state } = element
  if (!state) return (parent && parent.state) || {}
  if (isFunction(state)) state = exec(state, element)

  state = deepClone(state, ['update', 'parse', '__element'])
  state.__element = element
  state.parse = parseState
  state.update = updateState

  on.createState(state, element)

  return state
}
