'use strict'

import 'regenerator-runtime/runtime'

const id = function * () {
  let index = 1
  while (index < index + 1) {
    yield index++
  }
}

export const createKey = id()
