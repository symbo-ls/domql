'use strict'

import { METHODS } from "@domql/methods"
import { joinArrays } from "@domql/utils"
import { IGNORE_STATE_PARAMS } from "@domql/state"
import { IGNORE_PROPS_PARAMS } from "@domql/props"

export const METHODS_EXL = joinArrays(
  ['node', 'state', 'context', 'extend'],
  METHODS,
  IGNORE_STATE_PARAMS,
  IGNORE_PROPS_PARAMS
)