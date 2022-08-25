'use strict'

export const getActiveRoute = (
  route = window.location.pathname, level
) => `/${route.split('/')[level + 1]}`

export let lastLevel = 0

export const router = (
  element,
  path,
  state = {},
  level = 0,
  pushState = true
) => {
  const lastLevel = level
  const [ pathname, hash ] = (path).split('#')

  let route = getActiveRoute(pathname, level)
  const content = element.routes[route]

  if (content) {
    if (pushState) window.history.pushState(state, null, pathname + (hash ? `#${hash}` : ''))

    element.set({ extend: content })
    element.state.update({ route, hash })

    const rootNode = element.node
    rootNode.scrollTo({ behavior: 'smooth', top: 0, left: 0 })
    if (hash) {
      const activeNode = document.getElementById(hash)
      if (activeNode) {
        const top = activeNode.getBoundingClientRect().top + rootNode.scrollTop - 140
        rootNode.scrollTo({ behavior: 'smooth', top, left: 0 })
      }
    }
  }
}
