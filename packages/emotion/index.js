'use strict'

// import DOM from '../../src'
import { isObjectLike, exec, isObject, isEqualDeep } from '@domql/utils'
import { classList } from '../../src/element/mixins'
import createEmotion from '@emotion/css/create-instance'
const ENV = process.env.NODE_ENV

export const transformEmotionStyle = (emotion, live) => {
  return (params, element, state) => {
    const execParams = exec(params, element)
    if (params) {
      if (isObjectLike(element.class)) element.class.elementStyle = execParams
      else element.class = { elementStyle: execParams }
    }
    transformEmotionClass(emotion, live)(element.class, element, state, true)
  }
}

export const transformEmotionClass = (emotion, live) => {
  return (params, element, state, flag) => {
    if (element.style && !flag) return
    const { __ref } = element
    const { __class, __classNames } = __ref

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
    classList(__classNames, element, element.node, live)
    // return element.class
  }
}

export const transformDOMQLEmotion = (emotion, options) => {
  if (!emotion) emotion = createEmotion(options || { key: 'smbls' })

  return {
    style: transformEmotionStyle(emotion),
    class: transformEmotionClass(emotion)
  }
}
