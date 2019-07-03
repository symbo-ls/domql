'use strict'

import Err from '../../res/error'
import method from '../method'

export default (params, node) => {
  if (params) {
    if (typeof params === 'string') {
      params = document.createTextNode(params)
      method.append(params, node)
    } else Err('HTMLInvalidText', params)
  }
}
