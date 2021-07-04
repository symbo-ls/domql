'use strict'

import { exec, isObject } from '../../utils'

export default (params, element, node) => {
  element.props = exec(params, element)

  if (isObject(element.props)) element.props.update = () => element.update()

  return element
}
