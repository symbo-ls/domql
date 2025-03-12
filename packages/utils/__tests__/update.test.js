/**
 * @jest-environment node
 */

import { jest } from '@jest/globals'

// Must mock before importing
jest.unstable_mockModule('../key', () => ({
  createSnapshotId: jest.fn(() => 123)
}))

const { createSnapshotId } = await import('../key')
const { captureSnapshot } = await import('../update')

describe('captureSnapshot', () => {
  beforeEach(() => {
    jest.mocked(createSnapshotId).mockClear()
  })

  it('should create new snapshot for regular element', () => {
    const element = {
      __ref: {}
    }
    const options = {
      currentSnapshot: null,
      calleeElement: null
    }

    const [snapshotId, resultElement] = captureSnapshot(element, options)

    expect(snapshotId).toBe(123)
    expect(resultElement).toBe(element)
    expect(element.__ref.__currentSnapshot).toBe(123)
  })

  it('should handle callee element snapshot', () => {
    const calleeElement = {
      __ref: {
        __currentSnapshot: 456
      }
    }
    const element = {
      __ref: {}
    }
    const options = {
      currentSnapshot: 100,
      calleeElement
    }

    const [snapshotId, resultElement, updated] = captureSnapshot(
      element,
      options
    )

    expect(snapshotId).toBe(456)
    expect(resultElement).toBe(calleeElement)
    expect(updated).toBe(true)
  })
})
