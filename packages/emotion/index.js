'use strict'

import DOM from '../../src'
import { isObjectLike, exec } from '../../src/utils'
import { classList } from '../../src/element/mixins'

import { css } from 'emotion'

const style = (params, element, node) => {
  if (params) {
    if (isObjectLike(element.class)) element.class.style = params
    else element.class = { style: params }
  }
  classf(element.class, element, node)
}

const classf = (params, element, node) => {
  if (isObjectLike(params)) {
    const classObjHelper = {}
    for (const key in params) {
      const prop = exec(params[key], element)
      const CSSed = css(prop)
      classObjHelper[key] = CSSed
    }
    classList(classObjHelper, element, node)
  }
}

DOM.define({
  style,
  class: classf
}, {
  overwrite: true
})
