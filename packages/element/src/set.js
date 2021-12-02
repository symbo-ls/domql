'use strict'

import create from './create'

const removeContentElement = (params, element) => {
  if (params && element.content) {
    if (element.content.node) {
      if (element.content.tag === 'fragment') element.node.innerHTML = ''
      else element.node.removeChild(element.content.node)
    }

    if (element.__cached && element.__cached.content) {
      if (element.__cached.content.tag === 'fragment') element.__cached.content.parent.node.innerHTML = ''
      else element.__cached.content.remove()
    }

    delete element.content
  }
}

export const set = function (params, enter, leave) {
  const element = this

  removeContentElement(params, element)

  if (params) {
    const { childProto } = params
    if (!childProto && element.childProto) params.childProto = element.childProto
    create(params, element, 'content', {
      ignoreChildProto: true
    })
  }

  return element
}

// if (element.content && (isFunction(element.content) || element.content.node)) {
//   // leave(element, () => {
//   // console.log('remove', element.content)
//   // element.content.remove()
//   // element.content.update(params)
//   // element.node.removeChild(element.content.node)
//   // delete element.content
// }
