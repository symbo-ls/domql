'use strict'

import { exec } from '../../utils'

/**
 * Appends raw HTML as content
 * an original one as a child
 */
export default (param, element, node) => {
  const prop = exec(param, element)
  if (prop !== element.__html) {
    // const parser = new window.DOMParser()
    // param = parser.parseFromString(param, 'text/html')
    if (node.nodeName === 'SVG') node.textContent = prop
    else node.innerHTML = prop

    element.__html = prop
  }
}
