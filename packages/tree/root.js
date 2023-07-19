'use strict'

import { document } from '@domql/utils'
import { report } from '@domql/report'

export const ROOT = {
  key: ':root',
  node: document ? document.body : report('DocumentNotDefined', document)
}
<<<<<<<< HEAD:packages/element/tree.js

export const TREE = ROOT
========
>>>>>>>> feature/v2:packages/tree/root.js
