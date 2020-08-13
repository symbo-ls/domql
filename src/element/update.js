'use strict'

import { overwrite, exec, isObject } from '../utils'
import { throughDefine, throughTransform } from './iterate'
import { registry } from './params'
import * as on from '../event/on'

var update = function (params = {}, force = false) {
  var element = this
  var { node } = element

  // If element is string
  if (typeof params === 'string' || typeof params === 'number') {
    params = { text: params }
  }

  overwrite(element, params)

  // iterate through define
  if (isObject(params.define)) throughDefine(element)

  // iterate through transform
  if (isObject(params.transform)) throughTransform(element)

  for (const param in (force ? element : params) || element) {
    if ((param === 'set' || param === 'update') || !element[param] === undefined) return

    var execParam = exec(params[param], element)
    var execElementParam = exec(element[param], element)

    var hasDefined = element.define && element.define[param]
    var registeredParam = registry[param]

    if (registeredParam) {
      // Check if it's registered param
      if (typeof registeredParam === 'function') {
        registeredParam(force ? execElementParam : execParam, element, node)
      }

      if (param === 'style') registry['class'](element['class'], element, node)
    } else if (element[param] && !hasDefined) {
      // Create element
      update.call(execElementParam, execParam, true)
    } // else if (element[param]) create(execParam, element, param)
  }

  // run onUpdate
  if (element.on && typeof element.on.update === 'function') {
    on.update(element.on.update, element)
  }

  return this
}

export default update
