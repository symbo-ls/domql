'use strict'

import { report } from '@domql/report'
import { triggerEventOnUpdate } from '@domql/event'
import { IGNORE_STATE_PARAMS } from './ignore'
import { deepMerge, merge, overwriteDeep, overwriteShallow } from '@domql/utils'
import { checkIfInherits, createChangesByKey, findInheritedState, getParentStateInKey } from './inherit'

const STATE_UPDATE_OPTIONS = {
  overwrite: true,
  preventHoistElementUpdate: false,
  updateByState: true,
  execStateFunction: true,
  isHoisted: true,
  stateFunctionOverwrite: true
}

export const updateState = function (obj, options = STATE_UPDATE_OPTIONS) {
  const state = this
  const element = state.__element

  if (!options.updateByState) merge(options, STATE_UPDATE_OPTIONS)

  if (!state.__element) report('ElementOnStateIsNotDefined')
  if (options.preventInheritAtCurrentState === true) {
    options.preventInheritAtCurrentState = state
  } else if (options.preventInheritAtCurrentState) return

  if (!options.preventInitStateUpdateListener) {
    const initStateUpdateReturns = triggerEventOnUpdate('initStateUpdated', obj, element, options)
    if (initStateUpdateReturns === false) return element
  }

  applyOverwrite(state, obj, options)
  const updateIsHoisted = hoistStateUpdate(state, obj, options)
  if (updateIsHoisted) return state

  updateDependentState(state, obj, options)

  applyElementUpdate(state, obj, options)

  if (!options.preventStateUpdateListener) {
    triggerEventOnUpdate('stateUpdated', obj, element, options)
  }

  return state
}

const applyOverwrite = (state, obj, options) => {
  const { overwrite } = options
  if (!overwrite) return

  const shallow = overwrite === 'shallow'
  const merge = overwrite === 'merge'

  if (merge) {
    deepMerge(state, obj, IGNORE_STATE_PARAMS)
    return
  }

  const overwriteFunc = shallow ? overwriteShallow : overwriteDeep
  overwriteFunc(state, obj, IGNORE_STATE_PARAMS)
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
  if (options.replace) targetParent[stateKey] = value
  targetParent.update(changesValue, {
    execStateFunction: false,
    stateFunctionOverwrite: false,
    isHoisted: true,
    ...options,
    preventUpdate: options.preventHoistElementUpdate,
    overwrite: !options.replace
  })
  const hasNotUpdated = options.preventUpdate !== true || !options.preventHoistElementUpdate
  if (!options.preventStateUpdateListener && hasNotUpdated) {
    triggerEventOnUpdate('stateUpdated', obj, element, options)
  }
  return true
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
  if (options.preventUpdate !== true) {
    element.update({}, {
      ...options,
      updateByState: true
    })
  } else if (options.preventUpdate === 'recursive') {
    element.update({}, {
      ...options,
      isHoisted: false,
      updateByState: true,
      preventUpdate: true
    })
  }
}
