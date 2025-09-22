import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { getEstadisticas, EstadisticasResponse } from './api'
import api from './api'

// Mock data para las pruebas
const mockEstadisticasResponse: EstadisticasResponse = {
  resumen: {
    totalCalculos: 10,
    promedioImc: 23.5,
    promedioPeso: 70.5,
    minImc: 18.5,
    maxImc: 28.6,
    desviacionImc: 3.2,
    variacionImc: 10.1,
    variacionPeso: 15.3
  },
  categorias: [
    { categoria: 'Normal', cantidad: 5, porcentaje: 50.0 },
    { categoria: 'Sobrepeso', cantidad: 3, porcentaje: 30.0 },
    { categoria: 'Bajo peso', cantidad: 2, porcentaje: 20.0 }
  ],
  evolucionTemporal: [
    { fecha: '2025-09-20', imc: 22.5, peso: 70, altura: 1.75, categoria: 'Normal' },
    { fecha: '2025-09-21', imc: 23.1, peso: 72, altura: 1.75, categoria: 'Normal' },
    { fecha: '2025-09-22', imc: 24.0, peso: 74, altura: 1.75, categoria: 'Normal' }
  ]
}

const emptyEstadisticasResponse: EstadisticasResponse = {
  resumen: {
    totalCalculos: 0,
    promedioImc: 0,
    promedioPeso: 0,
    minImc: 0,
    maxImc: 0,
    desviacionImc: 0,
    variacionImc: 0,
    variacionPeso: 0
  },
  categorias: [],
  evolucionTemporal: []
}

describe('Pruebas de Integración - Endpoint de Estadísticas', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(api)
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    mockAxios.restore()
    vi.restoreAllMocks()
  })

  describe('getEstadisticas - Casos de éxito', () => {
    it('debe obtener estadísticas sin filtros de fecha', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(200, mockEstadisticasResponse)

      // Act
      const result = await getEstadisticas()

      // Assert
      expect(result).toEqual(mockEstadisticasResponse)
      expect(result.resumen.totalCalculos).toBe(10)
      expect(result.categorias).toHaveLength(3)
      expect(result.evolucionTemporal).toHaveLength(3)
    })

    it('debe obtener estadísticas con fecha de inicio', async () => {
      // Arrange
      const fechaInicio = '2025-09-01'
      mockAxios.onGet(`/imc/estadisticas?fechaInicio=${fechaInicio}`).reply(200, mockEstadisticasResponse)

      // Act
      const result = await getEstadisticas(fechaInicio)

      // Assert
      expect(result).toEqual(mockEstadisticasResponse)
      expect(mockAxios.history.get[0].url).toBe(`/imc/estadisticas?fechaInicio=${fechaInicio}`)
    })

    it('debe obtener estadísticas con fecha de fin', async () => {
      // Arrange
      const fechaFin = '2025-09-30'
      mockAxios.onGet(`/imc/estadisticas?fechaFin=${fechaFin}`).reply(200, mockEstadisticasResponse)

      // Act
      const result = await getEstadisticas(undefined, fechaFin)

      // Assert
      expect(result).toEqual(mockEstadisticasResponse)
      expect(mockAxios.history.get[0].url).toBe(`/imc/estadisticas?fechaFin=${fechaFin}`)
    })

    it('debe obtener estadísticas con rango de fechas completo', async () => {
      // Arrange
      const fechaInicio = '2025-09-01'
      const fechaFin = '2025-09-30'
      mockAxios.onGet(`/imc/estadisticas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`).reply(200, mockEstadisticasResponse)

      // Act
      const result = await getEstadisticas(fechaInicio, fechaFin)

      // Assert
      expect(result).toEqual(mockEstadisticasResponse)
      expect(mockAxios.history.get[0].url).toBe(`/imc/estadisticas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
    })

    it('debe manejar respuesta vacía correctamente', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(200, emptyEstadisticasResponse)

      // Act
      const result = await getEstadisticas()

      // Assert
      expect(result).toEqual(emptyEstadisticasResponse)
      expect(result.resumen.totalCalculos).toBe(0)
      expect(result.categorias).toHaveLength(0)
      expect(result.evolucionTemporal).toHaveLength(0)
    })

    it('debe validar la estructura de respuesta completa', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(200, mockEstadisticasResponse)

      // Act
      const result = await getEstadisticas()

      // Assert - Validar estructura del resumen
      expect(result.resumen).toHaveProperty('totalCalculos')
      expect(result.resumen).toHaveProperty('promedioImc')
      expect(result.resumen).toHaveProperty('promedioPeso')
      expect(result.resumen).toHaveProperty('minImc')
      expect(result.resumen).toHaveProperty('maxImc')
      expect(result.resumen).toHaveProperty('desviacionImc')
      expect(result.resumen).toHaveProperty('variacionImc')
      expect(result.resumen).toHaveProperty('variacionPeso')

      // Assert - Validar estructura de categorías
      expect(result.categorias).toBeInstanceOf(Array)
      if (result.categorias.length > 0) {
        expect(result.categorias[0]).toHaveProperty('categoria')
        expect(result.categorias[0]).toHaveProperty('cantidad')
        expect(result.categorias[0]).toHaveProperty('porcentaje')
      }

      // Assert - Validar estructura de evolución temporal
      expect(result.evolucionTemporal).toBeInstanceOf(Array)
      if (result.evolucionTemporal.length > 0) {
        expect(result.evolucionTemporal[0]).toHaveProperty('fecha')
        expect(result.evolucionTemporal[0]).toHaveProperty('imc')
        expect(result.evolucionTemporal[0]).toHaveProperty('peso')
        expect(result.evolucionTemporal[0]).toHaveProperty('altura')
        expect(result.evolucionTemporal[0]).toHaveProperty('categoria')
      }
    })
  })

  describe('getEstadisticas - Casos de error', () => {
    it('debe manejar error 401 - No autorizado', async () => {
      // Arrange
      const errorResponse = { message: 'Token no válido' }
      mockAxios.onGet('/imc/estadisticas').reply(401, errorResponse)

      // Act & Assert
      await expect(getEstadisticas()).rejects.toThrow('Token no válido')
    })

    it('debe manejar error 403 - Acceso denegado', async () => {
      // Arrange
      const errorResponse = { message: 'Acceso denegado' }
      mockAxios.onGet('/imc/estadisticas').reply(403, errorResponse)

      // Act & Assert
      await expect(getEstadisticas()).rejects.toThrow('Acceso denegado')
    })

    it('debe manejar error 404 - Recurso no encontrado', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(404, { message: 'Recurso no encontrado' })

      // Act & Assert
      await expect(getEstadisticas()).rejects.toThrow('Recurso no encontrado')
    })

    it('debe manejar error 500 - Error interno del servidor', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(500, { message: 'Error interno del servidor' })

      // Act & Assert
      await expect(getEstadisticas()).rejects.toThrow('Error interno del servidor')
    })

    it('debe manejar error de red sin respuesta', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').networkError()

      // Act & Assert
      await expect(getEstadisticas()).rejects.toThrow('No se pudieron obtener las estadísticas')
    })

    it('debe manejar timeout de conexión', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').timeout()

      // Act & Assert
      await expect(getEstadisticas()).rejects.toThrow('No se pudieron obtener las estadísticas')
    })

    it('debe manejar respuesta con estructura incorrecta', async () => {
      // Arrange
      const malformedResponse = { invalidStructure: true }
      mockAxios.onGet('/imc/estadisticas').reply(200, malformedResponse)

      // Act
      const result = await getEstadisticas()

      // Assert
      expect(result).toEqual(malformedResponse)
    })

    it('debe manejar error sin mensaje específico', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(400, {})

      // Act & Assert
      await expect(getEstadisticas()).rejects.toThrow('No se pudieron obtener las estadísticas')
    })
  })

  describe('getEstadisticas - Casos límite', () => {
    it('debe manejar fechas extremas', async () => {
      // Arrange
      const fechaInicio = '1900-01-01'
      const fechaFin = '2099-12-31'
      mockAxios.onGet(`/imc/estadisticas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`).reply(200, emptyEstadisticasResponse)

      // Act
      const result = await getEstadisticas(fechaInicio, fechaFin)

      // Assert
      expect(result).toEqual(emptyEstadisticasResponse)
    })

    it('debe manejar fechas en formato incorrecto (pasando como string)', async () => {
      // Arrange
      const fechaIncorrecta = 'fecha-incorrecta'
      mockAxios.onGet(`/imc/estadisticas?fechaInicio=${fechaIncorrecta}`).reply(400, { message: 'Formato de fecha inválido' })

      // Act & Assert
      await expect(getEstadisticas(fechaIncorrecta)).rejects.toThrow('Formato de fecha inválido')
    })

    it('debe manejar estadísticas con valores numéricos extremos', async () => {
      // Arrange
      const extremeStats: EstadisticasResponse = {
        resumen: {
          totalCalculos: 999999,
          promedioImc: 999.99,
          promedioPeso: 999.99,
          minImc: 0.01,
          maxImc: 999.99,
          desviacionImc: 999.99,
          variacionImc: 999.99,
          variacionPeso: 999.99
        },
        categorias: [
          { categoria: 'Extreme', cantidad: 999999, porcentaje: 100.0 }
        ],
        evolucionTemporal: []
      }
      mockAxios.onGet('/imc/estadisticas').reply(200, extremeStats)

      // Act
      const result = await getEstadisticas()

      // Assert
      expect(result.resumen.totalCalculos).toBe(999999)
      expect(result.resumen.promedioImc).toBe(999.99)
    })

    it('debe manejar múltiples llamadas concurrentes', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(200, mockEstadisticasResponse)

      // Act
      const promises = Array(5).fill(null).map(() => getEstadisticas())
      const results = await Promise.all(promises)

      // Assert
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result).toEqual(mockEstadisticasResponse)
      })
      expect(mockAxios.history.get).toHaveLength(5)
    })
  })

  describe('getEstadisticas - Validación de parámetros', () => {
    it('debe enviar solo fechaInicio cuando fechaFin es undefined', async () => {
      // Arrange
      const fechaInicio = '2025-09-01'
      mockAxios.onGet(`/imc/estadisticas?fechaInicio=${fechaInicio}`).reply(200, mockEstadisticasResponse)

      // Act
      await getEstadisticas(fechaInicio, undefined)

      // Assert
      expect(mockAxios.history.get[0].url).toBe(`/imc/estadisticas?fechaInicio=${fechaInicio}`)
    })

    it('debe enviar solo fechaFin cuando fechaInicio es undefined', async () => {
      // Arrange
      const fechaFin = '2025-09-30'
      mockAxios.onGet(`/imc/estadisticas?fechaFin=${fechaFin}`).reply(200, mockEstadisticasResponse)

      // Act
      await getEstadisticas(undefined, fechaFin)

      // Assert
      expect(mockAxios.history.get[0].url).toBe(`/imc/estadisticas?fechaFin=${fechaFin}`)
    })

    it('debe manejar strings vacíos como parámetros', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(200, mockEstadisticasResponse)

      // Act
      await getEstadisticas('', '')

      // Assert
      // Los strings vacíos no deberían añadir parámetros a la URL
      expect(mockAxios.history.get[0].url).toBe('/imc/estadisticas')
    })
  })
})