'use strict'

exports.method = {
  text (text) {
    this.node.innerHTML = text
  },
  assign (node, parent) {
    parent[node.key] = node
    this.append(node.node, parent.node)
  },
  append (node, parent) {
    parent.appendChild(node)
    return node
  },
  define (node, parent) {

  }
}