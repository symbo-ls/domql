'use strict'

import { define } from '@domql/define'
import { isObjectLike, exec } from '@domql/utils'
import { classList } from '@domql/mixins'

import { css } from '@emotion/css'

const style = (params, element, node) => {
  const execPareams = exec(params, element)
  if (params) {
    if (isObjectLike(element.class)) element.class.style = execPareams
    else element.class = { style: execPareams }
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

define({
  style,
  class: classf
}, {
  overwrite: true
})
