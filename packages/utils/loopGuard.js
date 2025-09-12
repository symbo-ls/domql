'use strict'

const WINDOW_MS = 500
const MAX_UPDATES_PER_WINDOW = 2000
const PER_ELEMENT_MAX_UPDATES = 200

const globalGuard = {
  windowStart: 0,
  totalUpdates: 0
}

export const shouldThrottleUpdates = () => {
  const now = Date.now()
  if (now - globalGuard.windowStart > WINDOW_MS) {
    globalGuard.windowStart = now
    globalGuard.totalUpdates = 0
  }
  globalGuard.totalUpdates++
  return globalGuard.totalUpdates > MAX_UPDATES_PER_WINDOW
}

export const noteElementUpdate = (el) => {
  const ref = el.__ref
  const now = Date.now()
  if (!ref.__loop) ref.__loop = { windowStart: now, count: 0 }
  const l = ref.__loop
  if (now - l.windowStart > WINDOW_MS) { l.windowStart = now; l.count = 0 }
  l.count++
  return l.count > PER_ELEMENT_MAX_UPDATES
}

export const getLoopStats = (el) => {
  return {
    elementCount: el.__ref?.__loop?.count || 0,
    globalCount: globalGuard.totalUpdates,
    windowMs: WINDOW_MS
  }
}


