'use strict'

import { report } from '@domql/report'
import { triggerEventOnUpdate } from '@domql/event'
import { IGNORE_STATE_PARAMS } from './ignore.js'
import { deepMerge, merge, overwriteDeep, overwriteShallow } from '@domql/utils'
import {
  checkIfInherits,
  createNestedObjectByKeyPath,
  findInheritedState,
  getParentStateInKey,
  getRootStateInKey
} from './inherit.js'

const STATE_UPDATE_OPTIONS = {
  overwrite: true,
  preventHoistElementUpdate: false,
  updateByState: true,
  isHoisted: true
}

export const updateState = async function (
  obj,
  options = STATE_UPDATE_OPTIONS
) {
  const state = this
  const element = state.__element

  if (options.onEach) options.onEach(element, state, element.context, options)

  if (!options.updateByState) merge(options, STATE_UPDATE_OPTIONS)

  if (!state.__element) report('ElementOnStateIsNotDefined')
  if (options.preventInheritAtCurrentState === true) {
    options.preventInheritAtCurrentState = state
  } else if (options.preventInheritAtCurrentState) return

  if (!options.preventBeforeStateUpdateListener) {
    const beforeStateUpdateReturns = await triggerEventOnUpdate(
      'beforeStateUpdate',
      obj,
      element,
      options
    )
    if (beforeStateUpdateReturns === false) return element
  }

  applyOverwrite(state, obj, options)
  const updateIsHoisted = await hoistStateUpdate(state, obj, options)
  if (updateIsHoisted) return state

  await updateDependentState(state, obj, options)

  await applyElementUpdate(state, obj, options)

  if (!options.preventStateUpdateListener) {
    await triggerEventOnUpdate('stateUpdate', obj, element, options)
  }

  return state
}

const applyOverwrite = (state, obj, options) => {
  const { overwrite } = options
  if (!overwrite) return

  const shallow = overwrite === 'shallow' || overwrite === 'shallow-once'
  const merge = overwrite === 'merge'

  if (merge) {
    deepMerge(state, obj, IGNORE_STATE_PARAMS)
    return
  }

  const overwriteFunc = shallow ? overwriteShallow : overwriteDeep
  if (options.overwrite === 'shallow-once') options.overwrite = true
  overwriteFunc(state, obj, IGNORE_STATE_PARAMS)
}

const hoistStateUpdate = async (state, obj, options) => {
  const element = state.__element
  const { parent, __ref: ref } = element

  const stateKey = ref?.__state
  const stateType = ref?.__stateType
  if (!stateKey) return

  const asksForInherit = checkIfInherits(element)
  const inheritedState = findInheritedState(element, parent, {
    returnParent: true
  })
  const shouldPropagateState =
    asksForInherit && inheritedState && !options.stopStatePropagation
  if (!shouldPropagateState) return

  const isStringState =
    stateType === 'string' || stateType === 'number' || stateType === 'boolean'
  const value = isStringState ? state.value : state.parse()
  const passedValue = isStringState ? state.value : obj

  const findRootState = getRootStateInKey(stateKey, parent.state)
  const findGrandParentState = getParentStateInKey(stateKey, parent.state)
  const changesValue = createNestedObjectByKeyPath(stateKey, passedValue)
  const targetParent = findRootState || findGrandParentState || parent.state
  if (options.replace) overwriteDeep(targetParent, changesValue || value) // check with createNestedObjectByKeyPath
  await targetParent.update(changesValue, {
    isHoisted: true,
    preventUpdate: options.preventHoistElementUpdate,
    overwrite: !options.replace,
    ...options
  })
  const hasNotUpdated =
    options.preventUpdate !== true || !options.preventHoistElementUpdate
  if (!options.preventStateUpdateListener && hasNotUpdated) {
    await triggerEventOnUpdate('stateUpdate', obj, element, options)
  }
  return true
}

const updateDependentState = async (state, obj, options) => {
  if (!state.__depends) return
  for (const el in state.__depends) {
    const dependentState = state.__depends[el]
    await dependentState.clean().update(state.parse(), options)
  }
}

const applyElementUpdate = async (state, obj, options) => {
  const element = state.__element
  if (options.preventUpdate !== true) {
    await element.update(
      {},
      {
        ...options,
        updateByState: true
      }
    )
  } else if (options.preventUpdate === 'recursive') {
    await element.update(
      {},
      {
        ...options,
        isHoisted: false,
        updateByState: true,
        preventUpdate: true
      }
    )
  }
}
