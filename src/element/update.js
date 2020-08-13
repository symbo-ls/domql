'use strict'

import { overwrite, exec, isObject } from '../utils'
import { throughDefine, throughTransform } from './iterate'
import { registry } from './params'
import * as on from '../event/on'
import create from './create'

var update = function (params = {}) {
  var element = this
  var { node } = element

  overwrite(element, params)

  // iterate through define
  if (isObject(params.define)) throughDefine(element)

  // iterate through transform
  if (isObject(params.transform)) throughTransform(element)
  console.log(params)

  for (const param in (params || element)) {
    if ((param === 'set' || param === 'update') || !element[param] === undefined) return

    var execParam = exec(params[param], element)

    var hasDefined = element.define && element.define[param]
    var registeredParam = registry[param]

    if (registeredParam) {
      // Check if it's registered param
      if (typeof registeredParam === 'function') {
        registeredParam(execParam, element, node)
      }

      if (param === 'style') registry['class'](element['class'], element, node)
    } else if (element[param] && !hasDefined) {
      // Create element
      // update.call(execParam, execParam, element, param)
    } // else if (element[param]) create(execParam, element, param)
  }

  // run onUpdate
  if (element.on && typeof element.on.update === 'function') {
    on.update(element.on.update, element)
  }

  return this
}

export default update
