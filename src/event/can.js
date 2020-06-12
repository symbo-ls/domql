'use strict'

import { nodes } from '../element'
import Report from '../utils/report'

export default {
  render (element) {
    var tag = element.tag || 'div'
    var isValid = nodes.body.indexOf(tag) > -1
    return isValid || Report('HTMLInvalidTag')
  }
}
