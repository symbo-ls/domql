'use strict'

import { execPromise, isObject, STATE_METHODS } from '@domql/utils'

export async function state (params, element, node) {
  const state = await execPromise(params, element)

  if (isObject(state)) {
    for (const param in state) {
      if (STATE_METHODS.includes(param)) continue
      if (!Object.hasOwnProperty.call(state, param)) continue
      // element.state[param] = exec(state[param], element)
    }
  }

  return element
}

export default state
