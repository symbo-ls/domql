'use strict'

import { window } from '@domql/globals'
import { merge } from '@domql/utils'

export const getActiveRoute = (
  route = window.location.pathname, level
) => `/${route.split('/')[level + 1]}`

export let lastLevel = 0

const defaultOptions = {
  level: lastLevel,
  pushState: true,
  scrollToTop: true,
  scrollToNode: false,
  useFragment: false,
  updateState: true,
  stateContentUpdate: false
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
    if (options.pushState) window.history.pushState(state, null, pathname + (hash ? `#${hash}` : ''))

    element.set({ tag: options.useFragment && 'fragment', extend: content })
    if (options.updateState) element.state.update({ route, hash }, { preventContentUpdate: !options.stateContentUpdate })

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
