'use strict'

import { arrayContainsOtherArray, deepClone, is, isNot, isObjectLike } from '@domql/utils'
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

export const getChildStateInKey = (stateKey, parentState, options) => {
  const arr = stateKey.split('/')
  const arrLength = arr.length - 1
  for (let i = 0; i < arrLength; i++) {
    const childKey = arr[i]
    const grandChildKey = arr[i + 1]
    const childInParent = parentState[childKey]
    if (childInParent && childInParent[grandChildKey]) {
      stateKey = grandChildKey
      parentState = childInParent
    } else return
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
  if (!inheritedState) return element.state

  if (is(inheritedState)('object', 'array')) {
    return deepClone(inheritedState, IGNORE_STATE_PARAMS)
  } else if (is(inheritedState)('string', 'number')) {
    ref.__stateType = 'string'
    return { value: inheritedState }
  }

  console.warn(ref.__state, 'is not present. Replacing with', {})
}

export const checkIfInherits = (element) => {
  const ref = element.__ref
  const stateKey = ref.__state
  if (!stateKey || isNot(stateKey)('number', 'string')) return false
  return true
}

export const isState = function (state) {
  if (!isObjectLike(state)) return false
  const keys = Object.keys(state)
  return arrayContainsOtherArray(keys, ['update', 'parse', 'clean', 'create', 'parent', 'rootUpdate'])
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
