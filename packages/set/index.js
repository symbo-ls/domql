'use strict'

import { create } from '@domql/create'

const removeContentElement = (params, element) => {
  if (params && element.content) {
    if (element.content.node) {
      if (element.content.tag === 'fragment') element.node.innerHTML = ''
      else element.node.removeChild(element.content.node)
    }

    if (element.__cache && element.__cache.content) {
      if (element.__cache.content.tag === 'fragment') element.__cache.content.parent.node.innerHTML = ''
      else element.__cache.content.remove()
    }

    delete element.content
  }
}

export const set = function (params, enter, leave) {
  const element = this

  removeContentElement(params, element)

  if (params) {
    const { childExtend } = params
    if (!childExtend && element.childExtend) params.childExtend = element.childExtend
    create(params, element, 'content', {
      ignoreChildExtend: true
    })
  }

  return element
}
