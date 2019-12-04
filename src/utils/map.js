'use strict'

import exec from '../element/params/exec'

var mapProperty = (obj, extention, element) => {
  for (const e in extention) {
    obj[e] = exec(extention[e], element)
  }
}

export default mapProperty
