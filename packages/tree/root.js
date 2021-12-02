'use strict'

import { report } from '@domql/report'

export const root = {
  key: ':root',
  node: document ? document.body : report('DocumentNotDefined', document)
}
