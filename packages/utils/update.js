'use strict'

import { createSnapshotId } from './key.js'

const snapshot = {
  snapshotId: createSnapshotId
}

export const captureSnapshot = (element, options) => {
  const ref = element.__ref

  const { currentSnapshot, calleeElement } = options
  const isCallee = calleeElement === element
  if (!calleeElement || isCallee) {
    const createdStanpshot = snapshot.snapshotId()
    ref.__currentSnapshot = createdStanpshot
    return [createdStanpshot, element]
  }

  const snapshotOnCallee = calleeElement.__ref.__currentSnapshot

  if (currentSnapshot < snapshotOnCallee) {
    return [snapshotOnCallee, calleeElement, true]
  }

  return [snapshotOnCallee, calleeElement]
}
