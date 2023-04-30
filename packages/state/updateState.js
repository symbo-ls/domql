'use strict'

import { report } from '@domql/report'
import { triggerEventOn } from '@domql/event'
import { IGNORE_STATE_PARAMS } from './ignore'
import { deepMerge, overwriteDeep, overwriteShallow } from '@domql/utils'
import { checkIfInherits, createChangesByKey, findInheritedState, getParentStateInKey } from './inherit'

export const updateState = function (obj, options = {}) {
  const state = this
  const element = state.__element

  if (!state.__element) report('ElementOnStateIsNotDefined')

  if (!options.preventInitStateUpdateListener) {
    const initStateUpdateReturns = triggerEventOn('initStateUpdated', element, obj)
    if (initStateUpdateReturns === false) return element
  }

  applyOverwrite(state, obj, options)

  hoistStateUpdate(state, obj, options)

  updateDependentState(state, obj, options)

  applyElementUpdate(state, obj, options)

  if (!options.preventStateUpdateListener) {
    triggerEventOn('stateUpdated', element, obj)
  }

  return state
}

const applyOverwrite = (state, obj, options) => {
  const { skipOverwrite, shallow } = options

  if (skipOverwrite === 'merge') {
    deepMerge(state, obj, IGNORE_STATE_PARAMS)
    return
  }

  if (!skipOverwrite) {
    const overwriteFunc = shallow ? overwriteShallow : overwriteDeep
    overwriteFunc(state, obj, IGNORE_STATE_PARAMS)
  }
}

const hoistStateUpdate = (state, obj, options) => {
  const element = state.__element
  const { parent, __ref: ref } = element
  const stateKey = ref.__state
  if (!stateKey) return

  const asksForInherit = checkIfInherits(element)
  const inheritedState = findInheritedState(element, parent, { returnParent: true })
  const shouldPropagateState = asksForInherit && inheritedState && !options.stopStatePropagation
  if (!shouldPropagateState) return

  const isStringState = (ref.__stateType === 'string')
  const value = isStringState ? state.value : state.parse()
  const passedValue = isStringState ? state.value : obj

  const findGrandParentState = getParentStateInKey(stateKey, parent.state)
  const changesValue = createChangesByKey(stateKey, passedValue)
  const targetParent = findGrandParentState || parent.state
  // console.warn(stateKey)
  // console.group(stateKey)
  // console.log(targetParent)
  // console.log(changesValue)
  // console.log(passedValue)
  // console.log(value)
  // console.groupEnd(stateKey)
  if (options.replace) targetParent[stateKey] = value
  targetParent.update(changesValue, {
    ...options,
    preventUpdate: options.preventHoistElementUpdate,
    skipOverwrite: options.replace
  })
}

const updateDependentState = (state, obj, options) => {
  if (!state.__depends) return
  for (const el in state.__depends) {
    const dependentState = state.__depends[el]
    dependentState.clean().update(state.parse(), options)
  }
}

const applyElementUpdate = (state, obj, options) => {
  const element = state.__element
  if (!options.preventUpdate) {
    element.update({}, {
      ...options,
      updateByState: true,
      preventUpdateTriggerStateUpdate: true
    })
  } else if (options.preventUpdate === 'recursive') {
    element.update({}, {
      ...options,
      preventUpdateTriggerStateUpdate: true,
      updateByState: true,
      preventUpdate: true
    })
  }
}
