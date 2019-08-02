'use strict'

export default (param, element) => {
  if (param) {
    if (typeof param === 'function')
      return param(element)
    return param
  }
}
