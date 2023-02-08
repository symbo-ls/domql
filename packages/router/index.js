'use strict'

import { window } from '@domql/globals'

export const splitRoute = (route = window.location.pathname) => route.slice(1).split('/')

export const router = (rootElement, path, state = {}, level = 0, pushState = true) => {
  const route = path || window.location.pathname
  const routes = splitRoute(route)

  const content = rootElement.routes[`/${routes[level]}`]

  if (content) {
    if (pushState) window.history.pushState(state, null, route)
    rootElement.set({ extend: content })
      .node.scrollIntoView({ behavior: 'smooth' })
  }

  if (level === 0) rootElement.state.update({ activePage: routes[level] })
}

export default router
