'use strict'

import { DEFAULT_METHODS } from '@domql/registry'
import { report } from '@domql/report'

export const define = (params, options = {}) => {
  const { overwrite } = options
  for (const param in params) {
    if (registry[param] && !overwrite) {
      report('OverwriteToBuiltin', param)
    } else registry[param] = params[param]
  }
  return registry
}