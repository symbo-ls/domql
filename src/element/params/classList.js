'use strict'

import browser from "../../utils/browser"

var classList = (params, element) => {
  var { node } = element
  if (params === true) params = element.class = element.key
  var trimmed = params.replace(/\s+/g,' ').trim()
  if (!trimmed || !node.classList) return

  var splitted = trimmed.split(' ')
  node.classList.add.apply(node.classList, splitted)
}

export default classList
