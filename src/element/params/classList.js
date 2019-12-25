'use strict'

import browser from '../../utils/browser'

var classList = (params, element) => {
  var { node } = element
  if (params === true) params = element.class = element.key
  var trimmed = params.replace(/\s+/g, ' ').trim()

  if (browser.IE && node.classList) {
    var split = trimmed.split(' ')
    split.map(value => {
      node.className += ' ' + value
    })
  } else node.classList = trimmed
}

export default classList
