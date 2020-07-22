'use strict'

import { report } from '../utils'

export default {
  node: document ? document.body : report('DocumentNotDefined', document)
}
