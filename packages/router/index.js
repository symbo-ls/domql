'use strict'

import { merge } from '@domql/utils'

export const getActiveRoute = (
  route = window.location.pathname, level
) => `/${route.split('/')[level + 1]}`

export let lastLevel = 0

const defaultOptions = {
  level: lastLevel,
  pushState: true,
  scrollTo: true
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
  const content = element.routes[route]

  if (content) {
    if (options.pushState) window.history.pushState(state, null, pathname + (hash ? `#${hash}` : ''))

    element.set({ extend: content })
    element.state.update({ route, hash })

    const rootNode = element.node
    if (options.scrollTo) rootNode.scrollTo({ behavior: 'smooth', top: 0, left: 0 })

    if (hash) {
      const activeNode = document.getElementById(hash)
      if (activeNode) {
        const top = activeNode.getBoundingClientRect().top + rootNode.scrollTop - 140
        rootNode.scrollTo({ behavior: 'smooth', top, left: 0 })
      }
    }
  }
}
