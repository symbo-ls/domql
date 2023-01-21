'use strict'

import { report } from '../utils'

const root = {
  key: ':root',
  // node: document ? global.body : report('DocumentNotDefined', document)
  node: global.body
}

export default root
