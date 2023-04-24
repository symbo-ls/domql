'use strict'

import { exec, isFunction } from '@domql/utils'
import { isMethod } from '@domql/methods'

export const throughInitialDefine = element => {
  const { define } = element
  for (const param in define) {
    let prop = element[param]

    if (isFunction(prop) && !isMethod(param)) {
      element.__exec[param] = prop
      element[param] = prop = exec(prop, element)
    }

    element.__cache[param] = prop
    element[param] = define[param](prop, element, element.state)
  }
  return element
}

export const throughUpdatedDefine = element => {
  const { define, __exec } = element
  const changes = {}
  for (const param in define) {
    const execParam = __exec[param]
    if (execParam) element.__cache[param] = execParam(element, element.state)
    const cached = exec(element.__cache[param], element)
    element[param] = define[param](cached, element, element.state)
  }
  return changes
}
