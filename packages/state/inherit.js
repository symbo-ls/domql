'use strict'

import { arrayContainsOtherArray, deepClone, is, isNot, isObjectLike } from '@domql/utils'

export const getParentStateInKey = (stateKey, parentState) => {
  const arr = stateKey.split('../')
  const arrLength = arr.length - 1
  for (let i = 0; i < arrLength; i++) {
    if (!parentState.parent) return null
    parentState = parentState.parent
  }
  return parentState
}

export const getChildStateInKey = (stateKey, parentState) => {
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
  return parentState[stateKey]
}

export const findInheritedState = (element, parent) => {
  const ref = element.__ref
  let stateKey = ref.__state
  if (!stateKey || isNot(stateKey)('number', 'string')) return element.state

  let parentState = parent.state
  if (stateKey.includes('../')) {
    parentState = getParentStateInKey(stateKey, parent.state)
    stateKey = stateKey.replaceAll('../', '')
  }
  if (!parentState) return
  return getChildStateInKey(stateKey, parentState)
}

export const createInheritedState = (element, parent) => {
  const ref = element.__ref
  const inheritedState = findInheritedState(element, parent)
  if (!inheritedState) return

  if (is(inheritedState)('object', 'array')) {
    return deepClone(inheritedState)
  } else if (is(inheritedState)('string', 'number')) {
    ref.__stateType = 'string'
    return { value: inheritedState }
  }

  console.warn(stateKey, 'is not present. Replacing with', {})
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
