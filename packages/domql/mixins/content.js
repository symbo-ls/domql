'use strict'

import set from '../set'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node, options) => {
  if (param && element) {
    if (element.content.update) {
      // const parsedContent = element.content.parseDeep(['class', 'on', 'tag'])
      // console.log(parsedContent)
      // if (!element.content.__ref) element.content.__ref = {}
      element.content.update()
    } else {
      // if (element.$setCollection || element.$setStateCollection || element.$setPropsCollection) return
      set.call(element, param, options)
    }
  }
}
