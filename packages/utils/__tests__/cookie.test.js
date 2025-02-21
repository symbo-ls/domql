import { jest } from '@jest/globals'

import {
  setCookie,
  getCookie,
  removeCookie,
  getLocalStorage,
  setLocalStorage
} from '../cookie.js'

// Mock document object
const mockDocument = {
  cookie: ''
}

describe('Cookie and Storage Utils', () => {
  let mockStorage
  let setItemSpy
  let getItemSpy

  beforeEach(() => {
    // Reset mocks before each test
    mockDocument.cookie = ''
    mockStorage = {}

    // Create storage mock with spies
    const localStorageMock = {
      getItem: key => mockStorage[key] || null,
      setItem: (key, value) => {
        mockStorage[key] = value
      }
    }

    // Set up global objects
    global.document = mockDocument
    global.window = {
      localStorage: localStorageMock
    }
    global.navigator = { userAgent: '' }

    // Create spies after setting up the mock
    setItemSpy = jest.spyOn(window.localStorage, 'setItem')
    getItemSpy = jest.spyOn(window.localStorage, 'getItem')
  })

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks()
  })

  describe('Cookie Operations', () => {
    it('should set a cookie', () => {
      setCookie('testCookie', 'testValue')
      expect(document.cookie).toContain('testCookie=testValue')
    })

    it('should get a cookie value', () => {
      document.cookie = 'testCookie=testValue'
      expect(getCookie('testCookie')).toBe('testValue')
    })

    it('should handle missing cookie', () => {
      expect(getCookie('nonexistent')).toBe('')
    })

    it('should remove a cookie', () => {
      document.cookie = 'testCookie=testValue'
      removeCookie('testCookie')
      expect(document.cookie).not.toContain('testCookie=testValue')
    })

    it('should handle undefined document gracefully', () => {
      global.document = undefined
      expect(() => setCookie('test', 'value')).not.toThrow()
      expect(() => getCookie('test')).not.toThrow()
      expect(() => removeCookie('test')).not.toThrow()
    })
  })
})
