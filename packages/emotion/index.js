'use strict'

import DOM from '../../src'
import { isObjectLike, exec, isObject, isEqualDeep, memoize } from '../../src/utils'
import { classList } from '../../src/element/mixins'
import createEmotion from '@emotion/css/create-instance'
const ENV = process.env.NODE_ENV

export const initDOMQLEmotion = (emotion, options) => {
  if (!emotion) emotion = createEmotion(options || { key: 'smbls'})

  const style = (params, element, node) => {
    const execPareams = exec(params, element)
    if (params) {
      if (isObjectLike(element.class)) element.class.elementStyle = execPareams
      else element.class = { elementStyle: execPareams }
    }
    classf(element.class, element, node, true)
  }

  const classf = (params, element, node, flag) => {
    if (element.style && !flag) return
    const { __class, __classNames } = element
    if (!isObjectLike(params)) return

    for (const key in params) {
      const prop = exec(params[key], element)

      if (!prop) {
        delete __class[key]
        delete __classNames[key]
        continue
      }

      const isEqual = isEqualDeep(__class[key], prop)
      if (!isEqual) {
        if ((ENV === 'test' || ENV === 'development') && isObject(prop)) prop.label = key || element.key
        const CSSed = emotion.css(prop)
        __class[key] = prop
        __classNames[key] = CSSed
      }
    }
    classList(__classNames, element, node)
  }

  DOM.define({
    style,
    class: classf
  }, {
    overwrite: true
  })
}
