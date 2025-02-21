'use strict'

export const setContentKey = (el, opts = {}) => {
  const { __ref: ref } = el
  const contentElementKey = opts.contentElementKey
  if (
    (contentElementKey !== 'content' &&
      contentElementKey !== ref.contentElementKey) ||
    !ref.contentElementKey
  ) {
    ref.contentElementKey = contentElementKey || 'content'
  } else ref.contentElementKey = 'content'
  if (contentElementKey !== 'content') opts.contentElementKey = 'content'
  return ref.contentElementKey
}
