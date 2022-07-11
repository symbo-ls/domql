'use strict'

export const splitRoute = (route = window.location.pathname) => route.split('/')

export const router = (rootElement, path, state = {}, level = 0, pushState = true) => {
  const route = path || window.location.pathname

  if (path.slice(0, 1) === '#') {
    window.location.hash = path
    return
  }

  const routes = splitRoute(route)
  let currentRoute = routes[level + 1]

  const hasHash = currentRoute.split('#')
  if (hasHash[1]) currentRoute = hasHash[0]

  const content = rootElement.routes[`/${currentRoute}`]

  if (content) {
    currentRoute = `/${currentRoute}`
    if (hasHash[1]) currentRoute += `#${hasHash[1]}`
    if (pushState) window.history.pushState(state, null, currentRoute)

    const rootNode = rootElement.node
    rootNode.scrollTo({ behavior: 'smooth', top: 0, left: 0 })
    if (hasHash[1]) {
      const activeNode = document.getElementById(hasHash[1])
      if (activeNode) {
        const top = activeNode.getBoundingClientRect().top + rootNode.scrollTop - 140
        rootNode.scrollTo({ behavior: 'smooth', top, left: 0 })
      }
    }

    rootElement.set({ proto: content })
  }

  if (level === 0) rootElement.state.update({ currentRoute })
}
