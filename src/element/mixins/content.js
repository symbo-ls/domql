'use strict'

import set from '../set'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node, options) => {
  if (param && element) {
    const preventDefineUpdate = element.$setStateCollection ? '$setStateCollection' : '$setPropsCollection'
    if (element.$setCollection || element.$setStateCollection || element.$setPropsCollection) return
    if (param.__hash === element.content.__hash && element.content.update) {
      if (!element.content.__ref) element.content.__ref = {}
      element.content.update(param, { ...options, preventDefineUpdate })
    } else {
      console.log('or here')
      set.call(element, param, { ...options, preventDefineUpdate })
    }
  }
}
