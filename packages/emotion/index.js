'use strict'

import { isObjectLike, exec } from '@domql/utils'
import { define } from '@domql/define'
import { classList } from '@domql/mixins/classList'

import { css } from '@emotion/css'

const style = (params, element, node) => {
  const execPareams = exec(params, element)
  if (params) {
    if (isObjectLike(element.class)) element.class.style = execPareams
    else element.class = { style: execPareams }
  }
  classf(element.class, element, node)
}

const classf = (element, node) => {
  const params = element.class
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
}, { overwrite: true })
