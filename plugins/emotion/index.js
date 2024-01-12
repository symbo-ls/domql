'use strict'

// import DOM from '../../src'
import { isObjectLike, exec, isObject, isEqualDeep, isProduction } from '@domql/utils'
import { applyClassListOnNode } from '@domql/classlist'
import createEmotion from '@emotion/css/create-instance'

export const transformEmotionStyle = (emotion) => {
  return (params, element, state) => {
    const execParams = exec(params, element)
    if (params) {
      if (isObjectLike(element.class)) element.class.elementStyle = execParams
      else element.class = { elementStyle: execParams }
    }
    transformEmotionClass(emotion)(element.class, element, element.state, true)
  }
}

export const transformEmotionClass = (emotion) => {
  return (params, element, state, flag) => {
    if (element.style && !flag) return
    const { __ref } = element
    const { __class, __classNames } = __ref

    if (!isObjectLike(params)) return
    if (element.props.class) {
      console.log(__classNames.class)
      console.log(element.props.class)
      __classNames.class = element.props.class
    }

    for (const key in params) {
      const prop = exec(params[key], element)

      if (!prop) {
        delete __class[key]
        delete __classNames[key]
        continue
      }

      const isEqual = isEqualDeep(__class[key], prop)
      if (!isEqual) {
        if (!isProduction() && isObject(prop)) prop.label = key || element.key
        const CSSed = emotion.css(prop)
        __class[key] = prop
        __classNames[key] = CSSed
      }
    }
    applyClassListOnNode(__classNames, element, element.node)
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
