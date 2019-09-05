'use strict'

import create from '../create'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node) => {
  if (param) {
    create(param, element, 'content')
  }
}
