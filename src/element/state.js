'use strict'

import { on } from '../event'
import { deepClone, exec, isFunction, overwriteDeep } from '../utils'
import { measure } from '@domql/performance'

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

  // run `on.stateUpdated`
  if (element.on && isFunction(element.on.initStateUpdated)) {
    on.initStateUpdated(element.on.initStateUpdated, element, state)
  }

  measure('State: Overwrite ' + element.key, () => {
    overwriteDeep(state, obj, ['update', 'parse', '__element'])
  })

  measure('State: Element Update', () => {
    if (!options.preventUpdate) element.update({}, options)
  })

  // run `on.stateUpdated`
  if (element.on && isFunction(element.on.stateUpdated)) {
    on.stateUpdated(element.on.stateUpdated, element, state)
  }
}

export default function (element, parent) {
  let { state } = element
  // if (!state) return (parent && parent.state) || {}
  if (!state) {
    if (parent && parent.state) return parent.state
    return {}
  }
  if (isFunction(state)) state = exec(state, element)

  element.state = state = deepClone(state, ['update', 'parse', '__element'])
  state.__element = element
  state.parse = parseState
  state.update = updateState
  state.parent = element.parent.state

  // run `on.stateCreated`
  if (element.on && isFunction(element.on.stateCreated)) {
    on.stateCreated(element.on.stateCreated, element, state)
  }

  return state
}
