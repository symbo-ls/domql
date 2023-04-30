'use strict'

import { DEFAULT_METHODS } from '@domql/registry'
import { report } from '@domql/report'

export const define = (params, options = {}) => {
  const { overwrite } = options
  for (const param in params) {
    if (DEFAULT_METHODS[param] && !overwrite) {
      report('OverwriteToBuiltin', param)
    } else DEFAULT_METHODS[param] = params[param]
  }
  return DEFAULT_METHODS
}
