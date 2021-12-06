'use strict'

import { exec } from '@domql/utils'

/**
 * Appends raw HTML as content
 * an original one as a child
 */
export const html = (param, element, node) => {
  const prop = exec(param, element)
  if (prop) {
    // const parser = new window.DOMParser()
    // param = parser.parseFromString(param, 'text/html')
    if (node.nodeName === 'SVG') node.textContent = prop
    else node.innerHTML = prop
  }
}
