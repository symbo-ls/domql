'use strict'

import { deepCloneWithExtnd, is, isObjectLike, isUndefined } from '@domql/utils'
import { IGNORE_STATE_PARAMS } from './ignore'

export const getParentStateInKey = (stateKey, parentState) => {
  if (!stateKey.includes('../')) return
  const arr = stateKey.split('../')
  const arrLength = arr.length - 1
  for (let i = 0; i < arrLength; i++) {
    if (!parentState.parent) return null
    parentState = parentState.parent
  }
  return parentState
}

export const getChildStateInKey = (stateKey, parentState, options = {}) => {
  const arr = stateKey.split('/')
  const arrLength = arr.length - 1
  for (let i = 0; i < arrLength; i++) {
    const childKey = arr[i]
    const grandChildKey = arr[i + 1]

    if (childKey === '__proto__' || grandChildKey === '__proto__') return

    let childInParent = parentState[childKey]
    if (!childInParent) childInParent = parentState[childKey] = {} // check for array
    if (!childInParent[grandChildKey]) childInParent[grandChildKey] = {} // check for array

    stateKey = grandChildKey
    parentState = childInParent
  }
  if (options.returnParent) return parentState
  return parentState[stateKey]
}

export const findInheritedState = (element, parent, options = {}) => {
  const ref = element.__ref
  let stateKey = ref.__state
  if (!checkIfInherits(element)) return

  let parentState = parent.state
  const findGrandParentState = getParentStateInKey(stateKey, parent.state)
  if (findGrandParentState) {
    parentState = findGrandParentState
    stateKey = stateKey.replaceAll('../', '')
  }

  if (!parentState) return
  return getChildStateInKey(stateKey, parentState, options)
}

export const createInheritedState = (element, parent) => {
  const ref = element.__ref
  const inheritedState = findInheritedState(element, parent)
  if (isUndefined(inheritedState)) return element.state

  if (is(inheritedState)('object', 'array')) {
    return deepCloneWithExtnd(inheritedState, IGNORE_STATE_PARAMS)
  } else if (is(inheritedState)('string', 'number', 'boolean')) {
    ref.__stateType = typeof inheritedState
    return { value: inheritedState }
  }

  console.warn(ref.__state, 'is not present. Replacing with', {})
}

export const checkIfInherits = (element) => {
  const ref = element.__ref
  const stateKey = ref.__state

  if (stateKey && is(stateKey)('number', 'string', 'boolean')) return true
  return false
}

export const isState = function (state) {
  if (!isObjectLike(state)) return false
  return state.update &&
    state.parse &&
    state.clean &&
    state.create &&
    state.parent &&
    state.destroy &&
    state.rootUpdate &&
    state.parentUpdate &&
    state.toggle &&
    state.add &&
    state.apply &&
    state.__element &&
    state.__children
  // return arrayContainsOtherArray(keys, ['update', 'parse', 'clean', 'create', 'parent', 'rootUpdate'])
}

export const createChangesByKey = (path, value) => {
  if (!path) {
    return value || {}
  }
  const keys = path.split('/')
  const obj = {}
  let ref = obj
  keys.forEach((key, index) => {
    ref[key] = index === keys.length - 1 ? value || {} : {}
    ref = ref[key]
  })
  return obj
}
