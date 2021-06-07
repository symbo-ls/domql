'use strict'

import create from './create'

const set = function (params, enter, leave) {
  const element = this

  console.log(params)

  if (params && element.content) {
    if (element.content.node) element.node.removeChild(element.content.node)
    if (element.__cached && element.__cached.content) element.__cached.content.remove()
    delete element.content
  }

  if (params) {
    const { childProto } = params
    if (!childProto && element.childProto) params.childProto = element.childProto
    create(params, element, 'content', {
      ignoreChildProto: true
    })
  }

  return element
}

export default set

// if (element.content && (isFunction(element.content) || element.content.node)) {
//   // leave(element, () => {
//   // console.log('remove', element.content)
//   // element.content.remove()
//   // element.content.update(params)
//   // element.node.removeChild(element.content.node)
//   // delete element.content
// }
