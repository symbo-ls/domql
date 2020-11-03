'use strict'

import root from '../src/element/root'

root.on = {
  scroll (event, element) {
    element.data = {
      scrollTop: event.scrollTop
    }
  }
}

export default root
