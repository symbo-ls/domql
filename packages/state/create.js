'use strict'

import { triggerEventOn } from '@domql/event'
import { deepClone, exec, is, isArray, isFunction, isObject } from '@domql/utils'
import { IGNORE_STATE_PARAMS } from './ignore'
import { add, apply, clean, destroy, parentUpdate, parse, remove, rootUpdate, set, toggle } from './methods'
import { updateState } from './updateState'
import { checkIfInherits, createInheritedState } from './inherit'

export const createState = function (element, parent, options) {
  element.state = applyInitialState(element, parent, options)
}

export const applyInitialState = function (element, parent, options) {
  const skipApplyMethods = Boolean(options && options.skipApplyMethods)

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
    element.state.parent = element.parent.state ?? {}
    element.state.parse = parse.bind(element.state)

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

const addProtoToArray = (state, proto) => {
  for (const key in proto) {
    Object.defineProperty(state, key, {
      value: proto[key],
      enumerable: false, // Set this to true if you want the method to appear in for...in loops
      configurable: true, // Set this to true if you want to allow redefining/removing the property later
      writable: true // Set this to true if you want to allow changing the function later
    })
  }
}

const applyMethods = (element) => {
  const state = element.state
  const ref = element.__ref

  const proto = {
    clean: clean.bind(state),
    parse: parse.bind(state),
    destroy: destroy.bind(state),
    update: updateState.bind(state),
    rootUpdate: rootUpdate.bind(state),
    parentUpdate: parentUpdate.bind(state),
    create: createState.bind(state),
    add: add.bind(state),
    toggle: toggle.bind(state),
    remove: remove.bind(state),
    apply: apply.bind(state),
    set: set.bind(state),
    parent: element.parent.state,
    __element: element,
    __children: {},
    __root: ref.__root ? ref.__root.state : state
  }

  if (isArray(state)) {
    addProtoToArray(state, proto)
  } else {
    Object.setPrototypeOf(state, proto)
  }

  if (state.parent) state.parent.__children[element.key] = state
}
