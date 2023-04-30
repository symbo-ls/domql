'use strict'

import { set } from '@domql/set'

/**
 * Appends anything as content
 * an original one as a child
 */
export const content = (param, element, node) => {
  if (param && element) {
<<<<<<< HEAD:src/element/mixins/content.js
    if (element.content.update) {
      // const parsedContent = element.content.parseDeep(['class', 'on', 'tag'])
      // console.log(parsedContent)
      // if (!element.content.__ref) element.content.__ref = {}
      element.content.update()
    } else {
      // if (element.$setCollection || element.$setStateCollection || element.$setPropsCollection) return
      set.call(element, param, options)
=======
    if (param.__hash === element.content.__hash && element.content.update) {
      element.content.update(param)
    } else {
      set.call(element, param)
>>>>>>> feature/v2:packages/mixins/content.js
    }
  }
}
