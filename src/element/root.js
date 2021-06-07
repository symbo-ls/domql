'use strict'

import { report } from '../utils'

const root = {
  key: ':root',
  node: document ? document.body : report('DocumentNotDefined', document)
}

export default root
