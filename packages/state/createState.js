'use strict'

import { triggerEventOn } from '@domql/event'
import { deepClone, exec, is, isFunction, isObject } from '@domql/utils'
import { IGNORE_STATE_PARAMS } from './ignore'
import { add, apply, clean, destroy, parentUpdate, parse, remove, rootUpdate, set, toggle } from './methods'
import { updateState } from './updateState'
import { checkIfInherits, createInheritedState } from './inherit'

export const createState = function (element, parent, options) {
  const skipApplyMethods = Boolean(options?.skipApplyMethods)

  const objectizeState = checkForTypes(element)
  if (objectizeState === false) return parent.state || {}
  else element.state = deepClone(objectizeState, IGNORE_STATE_PARAMS)

  const whatInitReturns = triggerEventOn('stateInit', element, options)
  if (whatInitReturns === false) return element.state

  if (checkIfInherits(element)) {
    const inheritedState = createInheritedState(element, parent)
    element.state = inheritedState || {}
  }

  const dependentState = applyDependentState(element, element.state)
  if (dependentState) element.state = dependentState

  // NOTE: Only true when 'onlyResolveExtends' option is set to true
  if (skipApplyMethods) {
    state.parent = element.parent.state
    return element.state
  }

  applyMethods(element)

  // trigger `on.stateCreated`
  triggerEventOn('stateCreated', element)

  return element.state
}

const applyDependentState = (element, state) => {
  const { __ref: ref } = state
  if (!ref) return
  const dependentState = deepClone(ref, IGNORE_STATE_PARAMS)
  const newDepends = { [element.key]: dependentState }
  ref.__depends = isObject(ref.__depends)
    ? { ...ref.__depends, ...newDepends }
    : newDepends

  return dependentState
}

const checkForTypes = (element) => {
  const { state, __ref: ref } = element
  if (isFunction(state)) {
    ref.__state = state
    return exec(state, element)
  }
  if (is(state)('string', 'number')) {
    ref.__state = state
    return {}
  }
  if (state === true) {
    ref.__state = element.key
    return {}
  }
  if (state) {
    ref.__hasRootState = true
    return state
  }
  return false
}

const applyMethods = (element) => {
  const state = element.state
  const ref = element.__ref

  state.clean = clean
  state.parse = parse
  state.destroy = destroy
  state.update = updateState
  state.rootUpdate = rootUpdate
  state.parentUpdate = parentUpdate
  state.create = createState
  state.add = add
  state.toggle = toggle
  state.remove = remove
  state.apply = apply
  state.parent = element.parent.state
  state.set = set
  state.__element = element
  state.__children = {}
  state.__root = ref.__root ? ref.__root.state : state

  if (state.parent) state.parent.__children[element.key] = state
}
