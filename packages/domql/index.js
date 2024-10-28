'use strict'

import { TREE, create as createElement } from '@domql/element'

const create = (element, parent, key, options) => {
  // createState
  // createNode

  const domqlElement = (createElement.default || createElement)(element, parent, key, options)

  const complete = domqlElement.on?.complete
  if (complete) domqlElement.on.complete(element, element.state, element.context, options)
  const onComplete = domqlElement.props?.onComplete
  if (onComplete) domqlElement.props?.onComplete(element, element.state, element.context, options)

  const initInspect = domqlElement.on?.initInspect
  if (initInspect) domqlElement.on.initInspect(element, element.state, element.context, options)

  const initSync = domqlElement.on?.initSync
  if (initSync) domqlElement.on.initSync(element, element.state, element.context, options)

  return domqlElement
}

export default {
  TREE,
  create
}
