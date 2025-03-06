'use strict'

import { exec } from '@domql/utils'

/**
 * Appends raw HTML as content
 * an original one as a child
 */
export function html (param, element, node) {
  const prop = exec(param, element) || exec(element?.props?.html, element)
  const { __ref } = element
  if (prop !== __ref.__html) {
    // const parser = new window.DOMParser()
    // param = parser.parseFromString(param, 'text/html')
    if (node.nodeName === 'SVG') node.textContent = prop
    else node.innerHTML = prop
    __ref.__html = prop
  }
}

export default html
