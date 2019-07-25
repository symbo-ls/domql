'use strict'

import Err from '../res/error'
import setPrototype from '../utils/setPrototype'

/**
 * Sets a prototype an element
 */
export default (params) => {
  if (params) {
    setPrototype(params, params.proto)
  }
}
