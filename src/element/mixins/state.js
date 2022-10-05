'use strict'

import { exec, isObject } from '../../utils'
import { IGNORE_STATE_PARAMS } from '../state'

export default (params, element, node) => {
  const state = exec(params, element)

  if (isObject(state)) {
    for (const param in state) {
      IGNORE_STATE_PARAMS
      if (IGNORE_STATE_PARAMS.includes(param)) continue
      element.state[param] = exec(state[param], element)
    }
  }

  return element
}
