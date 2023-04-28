'use strict'

import { applyClassListOnNode } from '@domql/classlist'

export * from '@domql/classlist'

export default (params, element, node) => {
  applyClassListOnNode(params, element, node)
}
