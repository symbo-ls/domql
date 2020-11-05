'use strict'

/**
 * Appends raw HTML as content
 * an original one as a child
 */
export default (param, element, node) => {
  if (param) {
    // const parser = new window.DOMParser()
    // param = parser.parseFromString(param, 'text/html')
    if (node.nodeName === 'SVG') node.textContent = param
    else node.innerHTML = param
  }
}
