'use strict'

import store from './store'

var render = (parent) => {
  parent(store.render)
}

export default { render }
