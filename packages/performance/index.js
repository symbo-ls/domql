'use strict'

import { global } from '@domql/globals'

const OPTIONS = {
  logLevel: 4
}

export const measure = (key, func, options = OPTIONS) => {
  const perf = global.performance.now()
  func(perf)
  const diff = global.performance.now() - perf
  if (diff > 200 && options.logLevel > 0) console.group('measure', key) || console.error(diff) || console.groupEnd('measure', key)
  else if (diff > 100 && options.logLevel > 1) console.group('measure', key) || console.warn(diff) || console.groupEnd('measure', key)
  else if (diff > 35 && options.logLevel > 2) console.group('measure', key) || console.log(diff) || console.groupEnd('measure', key)
  else if (diff > 10 && options.logLevel > 3) console.group('measure', key) || console.log(diff) || console.groupEnd('measure', key)
  else if (diff > 0 && options.logLevel > 4) console.group('measure', key) || console.log(diff) || console.groupEnd('measure', key)
}
