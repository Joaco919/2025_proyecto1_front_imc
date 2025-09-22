import { describe, it, expect } from 'vitest'
import { toNumber, validateAltura, validatePeso } from './validations'

describe('Validation Utils', () => {
  describe('toNumber', () => {
    it('should convert string with comma to number', () => {
      expect(toNumber('1,75')).toBe(1.75)
    })

    it('should convert string with dot to number', () => {
      expect(toNumber('1.75')).toBe(1.75)
    })

    it('should handle integer strings', () => {
      expect(toNumber('70')).toBe(70)
    })

    it('should return NaN for invalid input', () => {
      expect(toNumber('abc')).toBeNaN()
    })
  })

  describe('validateAltura', () => {
    it('should return error for empty input', () => {
      expect(validateAltura('')).toBe('Ingresa tu altura en metros (ej.: 1.75).')
      expect(validateAltura('   ')).toBe('Ingresa tu altura en metros (ej.: 1.75).')
    })

    it('should return error for non-numeric input', () => {
      expect(validateAltura('abc')).toBe('La altura debe ser numérica (ej.: 1.75).')
    })

    it('should return error for altura <= 0', () => {
      expect(validateAltura('0')).toBe('La altura debe ser > 0 y < 3 metros.')
      expect(validateAltura('-1')).toBe('La altura debe ser > 0 y < 3 metros.')
    })

    it('should return error for altura >= 3', () => {
      expect(validateAltura('3')).toBe('La altura debe ser > 0 y < 3 metros.')
      expect(validateAltura('3.5')).toBe('La altura debe ser > 0 y < 3 metros.')
    })

    it('should return undefined for valid altura', () => {
      expect(validateAltura('1.75')).toBeUndefined()
      expect(validateAltura('1,80')).toBeUndefined()
      expect(validateAltura('2.5')).toBeUndefined()
    })
  })

  describe('validatePeso', () => {
    it('should return error for empty input', () => {
      expect(validatePeso('')).toBe('Ingresa tu peso en kg (ej.: 70.5).')
      expect(validatePeso('   ')).toBe('Ingresa tu peso en kg (ej.: 70.5).')
    })

    it('should return error for non-numeric input', () => {
      expect(validatePeso('abc')).toBe('El peso debe ser numérico (ej.: 70.5).')
    })

    it('should return error for peso <= 0', () => {
      expect(validatePeso('0')).toBe('El peso debe ser > 0 y < 500 kg.')
      expect(validatePeso('-1')).toBe('El peso debe ser > 0 y < 500 kg.')
    })

    it('should return error for peso >= 500', () => {
      expect(validatePeso('500')).toBe('El peso debe ser > 0 y < 500 kg.')
      expect(validatePeso('600')).toBe('El peso debe ser > 0 y < 500 kg.')
    })

    it('should return undefined for valid peso', () => {
      expect(validatePeso('70')).toBeUndefined()
      expect(validatePeso('80,5')).toBeUndefined()
      expect(validatePeso('150.2')).toBeUndefined()
    })
  })
})