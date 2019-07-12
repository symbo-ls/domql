'use strict'

var text = (text, node) => {
  node.innerHTML = text
}

var append = (node, parent) => {
  parent.appendChild(node)
  return node
}

var assign = (node, parent) => {
  parent[node.key] = node
  append(node.node, parent.node)
}

var define = (node, parent) => {

}

export default {
  text,
  assign,
  append,
  define
}
