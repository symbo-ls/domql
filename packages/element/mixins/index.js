'use strict'

import { attr } from './attr'
import { applyClasslist } from './classList'
import { setContent } from './content'
import { data } from './data'
import { html } from './html'
import { style } from './style'
import { text } from './text'
import { state } from './state'
import { scope } from './scope'
import { REGISTRY } from './registry'

export { REGISTRY as registry }
export { applyClasslist as classList }
export { setContent as content }

export {
  attr,
  data,
  style,
  text,
  html,
  state,
  scope
}

export * from './registry'
