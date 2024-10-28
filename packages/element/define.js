'use strict'

import { report } from '@domql/report'
import { REGISTRY } from './mixins'

export default (params, options = {}) => {
  const { overwrite } = options
  for (const param in params) {
    if (REGISTRY[param] && !overwrite) {
      report('OverwriteToBuiltin', param)
    } else REGISTRY[param] = params[param]
  }
}
