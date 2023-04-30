'use strict'

import { triggerEventOn } from '@domql/event'
import { deepClone, exec, is, isFunction, isObject } from '@domql/utils'
import { IGNORE_STATE_PARAMS } from './ignore'
import { add, apply, clean, destroy, parse, remove, rootUpdate, toggle } from './methods'
import { updateState } from './update'
import { checkIfInherits, createInheritedState } from './utils'

export const createState = function (element, parent, opts) {
  const skip = (opts && opts.skip) ? opts.skip : false
  let { state, __ref: __elementRef } = element

  if (isFunction(state)) {
    __elementRef.__state = state
    state = element.state = exec(state, element)
  }

  if (is(state)('string', 'number')) {
    __elementRef.__state = state
    element.state = {}
  }
  if (state === true) {
    __elementRef.__state = element.key
    element.state = {}
  }

  // trigger `on.stateInit`
  triggerEventOn('stateInit', element)

  if (checkIfInherits(element)) {
    state = element.state = createInheritedState(element, parent) || {}
  }

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

const applyMethods = (element, state) => {
  const __elementRef = element.__ref

  state.clean = clean
  state.parse = parse
  state.destroy = destroy
  state.update = updateState
  state.rootUpdate = rootUpdate
  state.create = createState
  state.add = add
  state.toggle = toggle
  state.remove = remove
  state.apply = apply
  state.parent = element.parent.state
  state.__element = element
  state.__children = {}
  state.__root = __elementRef.__root ? __elementRef.__root.state : state

  if (state.parent) state.parent.__children[element.key] = state
}
