'use strict'

/**
 * Receives child and parent nodes as parametes
 * and assigns them into real DOM tree
 */
export const appendNode = (node, parentNode) => {
  parentNode.appendChild(node)
  return node
}

/**
 * Receives elements and assigns the first
 * parameter as a child of the second one
 */
export const assignNode = (element, parent, key) => {
  parent[key || element.key] = element
  appendNode(element.node, parent.node)
  return element
}
