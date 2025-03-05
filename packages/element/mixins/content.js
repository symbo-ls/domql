'use strict'

import { exec, setContentKey } from '@domql/utils'
import { set } from '../set.js'

export const updateContent = async function (params, options) {
  const element = this
  const ref = element.__ref

  const contentKey = ref.contentElementKey

  if (!element[contentKey]) return
  if (element[contentKey].update) {
    await element[contentKey].update(params, options)
  }
}

/**
 * Appends anything as content
 * an original one as a child
 */
export async function setContent (param, element, node, opts) {
  const contentElementKey = setContentKey(element, opts)
  const content = await exec(param, element)

  if (content && element) {
    if (element[contentElementKey].update) {
      await element[contentElementKey].update({}, opts)
    } else {
      await set.call(element, content, opts)
    }
  }
}

export default setContent
