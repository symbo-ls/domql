'use strict'

import { triggerEventOn } from '@domql/event'
import { deepClone, exec, is, isArray, isFunction, isObject, isUndefined } from '@domql/utils'
import { IGNORE_STATE_PARAMS } from './ignore.js'
import {
  add,
  apply,
  applyFunction,
  clean,
  destroy,
  parentUpdate,
  parse,
  remove,
  rootUpdate,
  set,
  reset,
  toggle,
  replace,
  quietUpdate,
  quietReplace,
  applyReplace,
  setByPath,
  setPathCollection,
  removeByPath,
  removePathCollection,
  getByPath,
  keys,
  values
} from './methods.js'
import { updateState } from './updateState.js'
import { checkIfInherits, createInheritedState } from './inherit.js'

export const createState = async function (element, parent, options) {
  element.state = await applyInitialState(element, parent, options)
  return element.state
}

export const applyInitialState = async function (element, parent, options) {
  const objectizeState = await checkForTypes(element)
  if (objectizeState === false) return parent.state || {}
  else element.state = objectizeState

  const whatInitReturns = triggerEventOn('stateInit', element, options)
  if (whatInitReturns === false) return element.state

  if (checkIfInherits(element)) {
    const inheritedState = createInheritedState(element, parent)
    element.state = isUndefined(inheritedState) ? {} : inheritedState
  }

  const dependentState = applyDependentState(element, element.state || parent.state || {})
  if (dependentState) element.state = dependentState

  applyMethods(element)

  // trigger `on.stateCreated`
  triggerEventOn('stateCreated', element)

  return element.state
}

const applyDependentState = (element, state) => {
  const { __ref, ref, __element } = state //
  const origState = exec(__ref || ref || __element?.state, element)
  if (!origState) return
  const dependentState = deepClone(origState, IGNORE_STATE_PARAMS)
  const newDepends = { [element.key]: dependentState }

  const __depends = isObject(origState.__depends)
    ? { ...origState.__depends, ...newDepends }
    : newDepends

  if (Array.isArray(origState)) {
    addProtoToArray(origState, { ...Object.getPrototypeOf(origState), __depends })
  } else {
    Object.setPrototypeOf(origState, { ...Object.getPrototypeOf(origState), __depends })
  }

  return dependentState
}

const checkForTypes = async (element) => {
  const { state: orig, props, __ref: ref } = element
  const state = props?.state || orig
  if (isFunction(state)) {
    ref.__state = state
    return await exec(state, element)
  } else if (is(state)('string', 'number')) {
    ref.__state = state
    return { value: state }
  } else if (state === true) {
    ref.__state = element.key
    return {}
  } else if (state) {
    ref.__hasRootState = true
    return state
  } else {
    return false
  }
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
    applyReplace: applyReplace.bind(state),
    applyFunction: applyFunction.bind(state),
    set: set.bind(state),
    quietUpdate: quietUpdate.bind(state),
    replace: replace.bind(state),
    quietReplace: quietReplace.bind(state),
    reset: reset.bind(state),
    parent: element.parent.state || state,

    setByPath: setByPath.bind(state),
    setPathCollection: setPathCollection.bind(state),
    removeByPath: removeByPath.bind(state),
    removePathCollection: removePathCollection.bind(state),
    getByPath: getByPath.bind(state),

    keys: keys.bind(state),
    values: values.bind(state),
    __element: element,
    __children: {},
    root: ref.root ? ref.root.state : state
  }

  if (isArray(state)) {
    addProtoToArray(state, proto)
  } else {
    Object.setPrototypeOf(state, proto)
  }

  if (state.parent && state.parent.__children) { state.parent.__children[element.key] = state }
}
