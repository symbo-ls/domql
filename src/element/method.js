'use strict'

var text = (text, node) => {
  node.innerHTML = text
}

/**
 * Receives child and parent nodes as parametes
 * and assigns them into real DOM tree
 */
var appendNode = (node, parentNode) => {
  parentNode.appendChild(node)
  return node
}

/**
 * Receives elements and assigns the first
 * parameter as a child of the second one
 */
var assignNode = (element, parentElement) => {
  parentElement[element.key] = element
  appendNode(element.node, parentElement.node)
}

var define = (node, parent) => {

}

export default {
  text,
  assignNode,
  appendNode,
  define
}
