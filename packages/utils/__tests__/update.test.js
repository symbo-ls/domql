import { jest } from '@jest/globals'
import { captureSnapshot } from '../update'
import { createSnapshotId } from '../key'

jest.mock('../key', () => ({
  createSnapshotId: jest.fn().mockReturnValue(123)
}))

describe('captureSnapshot', () => {
  beforeEach(() => {
    createSnapshotId.mockClear()
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
