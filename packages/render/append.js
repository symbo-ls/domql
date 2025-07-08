'use strict'

/**
 * Receives child and parent nodes as parametes
 * and assigns them into real DOM tree
 */
export const appendNode = (node, parentNode, el) => {
  const win = el?.context?.window || window
  try {
    if (parentNode && typeof parentNode.appendChild === 'function') {
      if (
        parentNode instanceof win.Node &&
        typeof parentNode.appendChild === 'function'
      ) {
        parentNode.appendChild(node)
      } else {
        throw new Error(
          'Invalid parentNode: appendChild is not supported on this node type.'
        )
      }
    } else {
      throw new Error(
        'Invalid parentNode: appendChild is not supported on this node type.'
      )
    }
  } catch (e) {
    // Fallback for older browsers
    if (node && node.parentNode) {
      node.parentNode.removeChild(node)
    }
    if (node && parentNode && parentNode instanceof win.Element) {
      parentNode.appendChild(node)
    }
  }
  return node
}

//q23
export const insertNodeAfter = (node, siblingNode, parentNode) => {
  const parent = parentNode || siblingNode.parentNode
  if (siblingNode.nextSibling) {
    parent && parent.insertBefore(node, siblingNode.nextSibling)
  } else if (siblingNode?.insertAdjacentElement) {
    siblingNode.insertAdjacentElement('afterend', node)
  } else {
    parent.insertBefore(node, siblingNode)
  }
}

export const insertNodeBefore = (node, siblingNode, parentNode) => {
  const parent = parentNode || siblingNode.parentNode
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
      ;(attachOptions.position === 'before'
        ? insertNodeBefore
        : insertNodeAfter)(element.node, attachOptions.node || parent.node)
    } else {
      appendNode(element.node, parent.node, element)
    }
  }
  return element
}
