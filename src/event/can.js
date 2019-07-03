'use strict'

import _ from 'lodash'
import Elem from '../element'
import Err from '../res/error'

export default {
  render (element) {
    var tag = element.tag || 'div'
    var isValid = _.indexOf(Elem.nodes.names, tag) > -1
    return isValid || Err('HTMLInvalidTag')
  }
}
