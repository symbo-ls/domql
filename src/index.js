'use strict'

import { create } from '@domql/create'
import { define } from '@domql/define'
import { update } from '@domql/update'

export * as _ from './allExports'

// export { parse } from '@domql/parse'
export { define } from '@domql/define'
export { tree } from '@domql/tree'

export default {
  TREE,
  create,
  define,
  update
}
