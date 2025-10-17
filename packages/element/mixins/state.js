'use strict'

import { IGNORE_STATE_PARAMS } from '@domql/state'
import { exec, isObject } from '@domql/utils'

export async function state(params, element, node, opts) {
  const state = exec(params, element, element.state, element.context, opts)

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
