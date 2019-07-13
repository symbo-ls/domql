'use strict'

import Elem from '../element'
import Err from '../res/error'

export default {
  render (element) {
    var tag = element.tag || 'div'
    var isValid = Elem.nodes.names.indexOf(tag) > -1
    return isValid || Err('HTMLInvalidTag')
  }
}
