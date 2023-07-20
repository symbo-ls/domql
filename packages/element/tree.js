'use strict'

import { document } from '@domql/utils'
import { report } from '@domql/report'

export const ROOT = {
  key: ':root',
  node: document ? document.body : report('DocumentNotDefined', document)
}

export const TREE = ROOT
