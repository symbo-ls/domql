'use strict'

export const registerFrameListener = (el) => {
  const { __ref: ref } = el
  const { frameListeners } = ref.root.data

  // Check if frameListeners exists and the element is not already in the Set
  if (frameListeners && !frameListeners.has(el)) {
    frameListeners.add(el) // Add the element to the Set
  }
}

export const applyAnimationFrame = (element, options) => {
  const { props, on, __ref: ref } = element
  const { frameListeners } = ref.root.data
  if (frameListeners && (on?.frame || props?.onFrame)) {
    registerFrameListener(element)
  }
}

export const initAnimationFrame = (ctx) => {
  const frameListeners = new Set()

  function requestFrame () {
    // Iterate over frameListeners

    if (!frameListeners.size) {
      window.cancelAnimationFrame(requestFrame) // Stop if no listeners
      return
    }

    for (const element of frameListeners) {
      if (!element.parent.node.contains(element.node)) {
        frameListeners.delete(element) // Remove if node has no parent
      } else {
        try {
          (element.on.frame || element.props.onFrame)(element, element.state, element.context)
        } catch (e) {
          console.warn(e)
        }
      }
    }
    window.requestAnimationFrame(requestFrame)
  }

  requestFrame()

  return frameListeners
}
