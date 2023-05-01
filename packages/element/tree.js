'use strict'

import { document } from '@domql/globals'
import { report } from '@domql/report'

export const TREE = {
  key: ':root',
  node: document ? document.body : report('DocumentNotDefined', document)
}
