'use strict'

import { exec, isObject, overwriteDeep } from '../../utils'

export const pureState = function () {
  const state = this
  const pureState = {}
  for (const param in state) {
    if (param !== '__element' && param !== 'update' && param !== 'pure') {
      pureState[param] = state[param]
    }
  }
  return pureState
}

export const updateState = function (obj) {
  const state = this
  overwriteDeep(state, obj)
  state.__element.update()
}

export default (params, element, node) => {
  const state = exec(params, element)

  if (isObject(state)) {
    for (const param in state) {
      if (param === 'update' || param === '__element' || param === 'pure') continue
      element.state[param] = exec(state[param], element)
    }
  }

  return element
}
