'use strict'

/**
 * Receives child and parent nodes as parametes
 * and assigns them into real DOM tree
 */
export const appendNode = (node, parentNode) => {
  parentNode.appendChild(node)
  return node
}

export const insertNodeAfter = (node, siblingNode, parentNode) => {
  const parent = (parentNode || siblingNode.parentNode)
  if (siblingNode.nextSibling) {
    parent && parent.insertBefore(node, siblingNode.nextSibling)
  } else {
    siblingNode && siblingNode.insertAdjacentElement('afterend', node)
  }
}

export const insertNodeBefore = (node, siblingNode, parentNode) => {
  const parent = (parentNode || siblingNode.parentNode)
  parent && parent.insertBefore(node, siblingNode)
}

/**
 * Receives elements and assigns the first
 * parameter as a child of the second one
 */
export const assignNode = (element, parent, key, attachOptions) => {
  parent[key || element.key] = element
  if (element.tag !== 'shadow') {
    if (attachOptions && attachOptions.position) {
      (attachOptions.position === 'before'
        ? insertNodeBefore
        : insertNodeAfter)(element.node, attachOptions.node || parent.node)
    } else {
      appendNode(element.node, parent.node)
    }
  }
  return element
}
