import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  API_BASE_URL
} from './api'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock console methods to avoid noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token management', () => {
    it('should get auth token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const token = getAuthToken()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token')
      expect(token).toBe('test-token')
    })

    it('should set auth token in localStorage', () => {
      setAuthToken('new-token')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token')
    })

    it('should remove auth token when setting null', () => {
      setAuthToken(null)
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })

    it('should clear auth token', () => {
      clearAuthToken()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('API configuration', () => {
    it('should have correct base URL', () => {
      expect(API_BASE_URL).toBe('https://two025-proyecto1-back-imc-vlxv.onrender.com')
    })
  })
})