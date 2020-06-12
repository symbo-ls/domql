'use strict'

import { registry } from './params'
import { report } from '../utils'

export default (params, options) => {
  var { overwrite } = options
  for (const param in params) {
    if (registry[param] && !overwrite) {
      report('OverwriteToBuiltin', param)
    } else registry[param] = params[param]
  }
}
