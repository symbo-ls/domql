'use strict'

import { exec, IGNORE_STATE_PARAMS, isObject } from '@domql/utils'

export function state (params, element, node) {
  const state = exec(params, element)

  if (isObject(state)) {
    for (const param in state) {
      if (IGNORE_STATE_PARAMS.includes(param)) continue
      if (!Object.hasOwnProperty.call(state, param)) continue
      // element.state[param] = exec(state[param], element)
    }
  }

  return element
}

export default state
