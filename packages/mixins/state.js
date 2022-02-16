'use strict'

import { exec, isObject } from '@domql/utils'

export const state = (params, element, node) => {
  const state = exec(params, element)

  if (isObject(state)) {
    for (const param in state) {
      if (param === 'update' || param === '__element' || param === 'parse') continue
      element.state[param] = exec(state[param], element)
    }
  }

  return element
}
