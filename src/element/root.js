'use strict'

import { document } from '@domql/globals'
import { report } from '@domql/report'

const root = {
  key: ':root',
  node: document ? document.body : report('DocumentNotDefined', document)
}

export default root
