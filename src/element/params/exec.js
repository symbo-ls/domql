'use strict'

export default (param, element) => {
  if (param !== undefined) {
    if (typeof param === 'function') { return param(element) }
    return param
  }
}
