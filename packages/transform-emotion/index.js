'use strict'

import { exec, isObject, isObjectLike } from '@domql/utils'
import { classify } from '@domql/classlist'
import createEmotion from '@emotion/css/create-instance'
const ENV = process.env.NODE_ENV

export const {
  flush,
  hydrate,
  cx,
  merge,
  getRegisteredStyles,
  injectGlobal,
  keyframes,
  css,
  sheet,
  cache
} = createEmotion({
  key: 'smbls'
})

export const transformClass = element => {
  const { ref } = element
  if (!isObjectLike(element.class)) return

  if (!ref.class) ref.class = {}
  if (element.style) ref.class.default = element.style

  for (const key in element.class) {
    ref.class[key] = exec(element.class[key], element)
  }

  return ref.class
}

export const transformEmotion = element => {
  transformClass(element)

  const { ref } = element

  const classObjHelper = {}
  for (const key in ref.class) {
    const prop = exec(ref.class[key], element)
    if (!prop) continue
    if ((ENV === 'test' || ENV === 'development') && isObject(prop)) prop.label = key || element.key
    const CSSed = css(prop)
    classObjHelper[key] = CSSed
  }

  return classify(classObjHelper, element)
}
