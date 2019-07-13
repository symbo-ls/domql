'use strict'

import Err from '../../res/error'

export default (params, node) => {
  if (params) {
    if (!(typeof params === 'object')) Err('HTMLInvalidData', params)
    for (let dataset in params) {
      node.dataset[dataset] = params[dataset]
    }
  }
}
