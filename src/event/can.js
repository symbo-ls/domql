'use strict'

import Elem from '../element'
import Err from '../res/error'

import indexOf from 'lodash.indexof'

export default {
  render (element) {
    var tag = element.tag || 'div'
    var isValid = indexOf(Elem.nodes.names, tag) > -1
    return isValid || Err('HTMLInvalidTag')
  }
}
