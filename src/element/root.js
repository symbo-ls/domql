'use strict'

import { document } from '@domql/globals'
import { report } from '../utils'

const root = {
  key: ':root',
  node: document ? document.body : report('DocumentNotDefined', document)
}

export default root
