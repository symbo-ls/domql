'use strict'

import { exec, registry } from './params'

var update = (element, params) => {
  for (const param in params) {
    var execParam = exec(params[param], element)
    var registeredParam = registry[element]
    if (registeredParam) {
      // Check if it's registered param
      if (typeof registeredParam === 'function') {
        registeredParam(execParam, element, element.node)
      }
    }
  }
}

export default update
