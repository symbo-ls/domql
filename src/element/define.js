'use strict'

import { registry } from '@domql/mixins'
import { report } from '../utils'

export default (params, options = {}) => {
  const { overwrite } = options
  for (const param in params) {
    if (registry[param] && !overwrite) {
      report('OverwriteToBuiltin', param)
    } else registry[param] = params[param]
  }
}
