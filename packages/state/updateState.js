'use strict'

import { report } from '@domql/report'
import { triggerEventOn } from '@domql/event'
import { IGNORE_STATE_PARAMS } from './ignore'
import { deepMerge, overwriteDeep, overwriteShallow } from '@domql/utils'
import { checkIfInherits } from './utils'

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

  applyDependentState(state, obj, options)

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
  const __elementRef = element.__ref
  const stateKey = __elementRef.__state
  const hasParentState = checkIfInherits(element)
  const shouldPropagateState = stateKey && hasParentState && !options.stopStatePropagation
  const parentState = element.parent.state

  if (shouldPropagateState) {
    const isStringState = (__elementRef.__stateType === 'string')
    const value = isStringState ? state.value : state.parse()
    const passedValue = isStringState ? state.value : obj

    parentState[stateKey] = value
    parentState.update({ [stateKey]: passedValue }, {
      skipOverwrite: true,
      preventUpdate: options.preventHoistElementUpdate,
      ...options
    })
  }
}

const applyDependentState = (state, obj, options) => {
  if (state.__depends) {
    for (const el in state.__depends) {
      const findElement = state.__depends[el]
      findElement.clean().update(state.parse(), options)
    }
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
