'use strict'

/**
 * Appends raw HTML as content
 * an original one as a child
 */
export default (param, element, node) => {
  if (param) {
    // var parser = new window.DOMParser()
    // param = parser.parseFromString(param, 'text/html')
    node.innerHTML = param
    console.log(param, element, node.outerHTML)
  }
}
