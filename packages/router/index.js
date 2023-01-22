'use strict'

import { global } from '@domql/globals'
import { merge } from '@domql/utils'

export const getActiveRoute = (
  route = global.location.pathname, level
) => `/${route.split('/')[level + 1]}`

export let lastLevel = 0

const defaultOptions = {
  level: lastLevel,
  pushState: true,
  scrollToTop: true,
  scrollToNode: false,
  useFragment: false,
  updateState: true
}

export const router = (
  element,
  path,
  state = {},
  options = defaultOptions
) => {
  merge(options, defaultOptions)
  lastLevel = options.lastLevel

  const [pathname, hash] = (path).split('#')

  const route = getActiveRoute(pathname, options.level)
  const content = element.routes[route] || element.routes['/*']

  if (content) {
    if (options.pushState) global.history.pushState(state, null, pathname + (hash ? `#${hash}` : ''))

    element.set({ tag: options.useFragment && 'fragment', extend: content })
    if (options.updateState) element.state.update({ route, hash })

    const rootNode = element.node
    if (options.scrollToTop) rootNode.scrollTo({ behavior: 'smooth', top: 0, left: 0 })
    if (options.scrollToNode) content.content.node.scrollTo({ behavior: 'smooth', top: 0, left: 0 })

    if (hash) {
      const activeNode = document.getElementById(hash)
      if (activeNode) {
        const top = activeNode.getBoundingClientRect().top + rootNode.scrollToTopp - 140
        rootNode.scrollTo({ behavior: 'smooth', top, left: 0 })
      }
    }
  }
}
