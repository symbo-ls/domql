'use strict'

/**
 * Receives child and parent nodes as parametes
 * and assigns them into real DOM tree
 */
export const appendNode = (node, parentNode) => {
  parentNode.appendChild(node)
  return node
}

export const insertNodeAfter = (node, siblingNode) => {
  siblingNode.parentNode.insertBefore(node, siblingNode.nextSibling)
}

/**
 * Receives elements and assigns the first
 * parameter as a child of the second one
 */
export const assignNode = (element, parent, key, insertAfter) => {
  parent[key || element.key] = element
  if (element.tag !== 'shadow') {
    (insertAfter ? insertNodeAfter : appendNode)(element.node, parent.node)
  }
  return element
}
