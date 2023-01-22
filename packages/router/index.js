'use strict'

import { global } from '@domql/globals'

export const splitRoute = (route = global.location.pathname) => route.slice(1).split('/')

export default (rootElement, path, state = {}, level = 0, pushState = true) => {
  const route = path || global.location.pathname
  const routes = splitRoute(route)

  const content = rootElement.routes[`/${routes[level]}`]

  if (content) {
    if (pushState) global.history.pushState(state, null, route)
    rootElement.set({ extend: content })
      .node.scrollIntoView({ behavior: 'smooth' })
  }

  if (level === 0) rootElement.state.update({ activePage: routes[level] })
}
