'use strict'

import { report } from '@domql/report'
import { triggerEventOnUpdate } from '@domql/event'
import { IGNORE_STATE_PARAMS } from './ignore.js'
import { deepMerge, merge, overwriteDeep, overwriteShallow } from '@domql/utils'
import { checkIfInherits, createNestedObjectByKeyPath, findInheritedState, getParentStateInKey, getRootStateInKey } from './inherit.js'

const STATE_UPDATE_OPTIONS = {
  overwrite: true,
  preventHoistElementUpdate: false,
  updateByState: true,
  isHoisted: true,
  execStateFunction: true
}

export const updateState = async function (obj, options = STATE_UPDATE_OPTIONS) {
  const state = this
  const element = state.__element

  if (options.onEach) options.onEach(element, state, element.context, options)

  if (!options.updateByState) merge(options, STATE_UPDATE_OPTIONS)

  if (!state.__element) report('ElementOnStateIsNotDefined')
  if (options.preventInheritAtCurrentState === true) {
    options.preventInheritAtCurrentState = state
  } else if (options.preventInheritAtCurrentState) return

  if (!options.preventBeforeStateUpdateListener) {
    const beforeStateUpdateReturns = await triggerEventOnUpdate('beforeStateUpdate', obj, element, options)
    if (beforeStateUpdateReturns === false) return element
  }

  // Track changes while applying overwrite
  applyOverwrite(state, obj, options)
  const updateIsHoisted = await hoistStateUpdate(state, obj, options)
  if (updateIsHoisted) return state

  await updateDependentState(state, obj, options)

  // If no real state changes occurred, skip element update and listeners
  if (!options.__changed) return state


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
  const mergeMode = overwrite === 'merge'

  // Hard replace semantics: swap references and mark changed if identity differs
  if (options.replace === true) {
    let changed = false
    for (const k in obj) {
      if (IGNORE_STATE_PARAMS.includes(k)) continue
      if (state[k] !== obj[k]) { state[k] = obj[k]; changed = true }
    }
    if (changed) options.__changed = true
    return
  }

  if (mergeMode) {
    // deepMerge only assigns when the key doesn't exist; treat as a change to be safe
    deepMerge(state, obj, IGNORE_STATE_PARAMS)
    options.__changed = true
    return
  }

  if (shallow) {
    // Detect if any value actually changes before overwriting
    let changed = false
    for (const k in obj) {
      if (IGNORE_STATE_PARAMS.includes(k)) continue
      if (state[k] !== obj[k]) { changed = true; break }
    }
    overwriteShallow(state, obj, IGNORE_STATE_PARAMS)
    if (options.overwrite === 'shallow-once') options.overwrite = true
    if (changed) options.__changed = true
    return
  }

  // Deep overwrite with change tracking bubbled up via opts.__changed
  const odOpts = { exclude: IGNORE_STATE_PARAMS, __changed: false }
  overwriteDeep(state, obj, odOpts)
  if (odOpts.__changed) options.__changed = true
}

const hoistStateUpdate = async (state, obj, options) => {
  const element = state.__element
  const { parent, __ref: ref } = element

  const stateKey = ref?.__state
  const stateType = ref?.__stateType
  if (!stateKey) return

  const asksForInherit = checkIfInherits(element)
  const inheritedState = findInheritedState(element, parent, { returnParent: true })
  const shouldPropagateState = asksForInherit && inheritedState && !options.stopStatePropagation
  if (!shouldPropagateState) return

  const isStringState = (stateType === 'string' || stateType === 'number' || stateType === 'boolean')
  const value = isStringState ? state.value : state.parse()
  const passedValue = isStringState ? state.value : obj

  const findRootState = getRootStateInKey(stateKey, parent.state)
  const findGrandParentState = getParentStateInKey(stateKey, parent.state)
  const changesValue = createNestedObjectByKeyPath(stateKey, passedValue)
  const targetParent = findRootState || findGrandParentState || parent.state
  if (options.replace) overwriteDeep(targetParent, changesValue || value) // check with createNestedObjectByKeyPath
  await targetParent.update(changesValue, {
    execStateFunction: false,
    isHoisted: true,
    preventUpdate: options.preventHoistElementUpdate,
    overwrite: !options.replace,
    ...options
  })
  const hasNotUpdated = options.preventUpdate !== true || !options.preventHoistElementUpdate
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
    await element.update({}, {
      ...options,
      updateByState: true
    })
  } else if (options.preventUpdate === 'recursive') {
    await element.update({}, {
      ...options,
      isHoisted: false,
      updateByState: true,
      preventUpdate: true
    })
  }
}
