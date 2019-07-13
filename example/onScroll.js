'use strict'

import root from '../src/element/root'

root.on = {
  scroll (e, element) {
    element.data = {
      scrollTop: e.scrollTop
    }
  }
}

export default root
