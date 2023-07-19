'use strict'

import { exec, isObject } from '@domql/utils'
<<<<<<<< HEAD:packages/element/mixins/state.js
========
import { IGNORE_STATE_PARAMS } from '@domql/state'
>>>>>>>> feature/v2:packages/mixins/state.js

export const state = (params, element, node) => {
  const state = exec(params, element)

  if (isObject(state)) {
    for (const param in state) {
      element.state[param] = exec(state[param], element)
    }
  }

  return element
}
