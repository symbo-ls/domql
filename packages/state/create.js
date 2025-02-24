'use strict'

import { triggerEventOn } from '@domql/event'
import {
  addProtoToArray,
  applyDependentState,
  checkForStateTypes,
  checkIfInherits,
  createInheritedState,
  isArray,
  isUndefined
} from '@domql/utils'

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

export const createState = async function (element, parent, options) {
  element.state = await applyInitialState(element, parent, options)
  return element.state
}

export const applyInitialState = async function (element, parent, options) {
  const objectizeState = await checkForStateTypes(element)
  if (objectizeState === false) return parent.state || {}
  else element.state = objectizeState

  const whatInitReturns = triggerEventOn('stateInit', element, options)
  if (whatInitReturns === false) return element.state

  if (checkIfInherits(element)) {
    const inheritedState = createInheritedState(element, parent)
    element.state = isUndefined(inheritedState) ? {} : inheritedState
  }

  const dependentState = applyDependentState(
    element,
    element.state || parent.state || {}
  )
  if (dependentState) element.state = dependentState

  applyStateMethods(element)

  // trigger `on.stateCreated`
  triggerEventOn('stateCreated', element)

  return element.state
}

export const applyStateMethods = element => {
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

  if (state.parent && state.parent.__children) {
    state.parent.__children[element.key] = state
  }
}
