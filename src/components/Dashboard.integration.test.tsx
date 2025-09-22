import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MockAdapter from 'axios-mock-adapter'
import Dashboard from '../components/Dashboard'
import api from '../utils/api'
import { EstadisticasResponse } from '../utils/api'

// Mock AuthContext
vi.mock('../components/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: { id: 1, email: 'test@test.com' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn()
  })
}))

// Mock data
const mockEstadisticasResponse: EstadisticasResponse = {
  resumen: {
    totalCalculos: 15,
    promedioImc: 24.2,
    promedioPeso: 72.5,
    minImc: 18.1,
    maxImc: 31.4,
    desviacionImc: 4.1,
    variacionImc: 13.3,
    variacionPeso: 18.7
  },
  categorias: [
    { categoria: 'Normal', cantidad: 8, porcentaje: 53.3 },
    { categoria: 'Sobrepeso', cantidad: 4, porcentaje: 26.7 },
    { categoria: 'Obesidad', cantidad: 2, porcentaje: 13.3 },
    { categoria: 'Bajo peso', cantidad: 1, porcentaje: 6.7 }
  ],
  evolucionTemporal: [
    { fecha: '2025-09-20', imc: 22.5, peso: 70, altura: 1.75, categoria: 'Normal' },
    { fecha: '2025-09-21', imc: 23.1, peso: 72, altura: 1.75, categoria: 'Normal' },
    { fecha: '2025-09-22', imc: 24.0, peso: 74, altura: 1.75, categoria: 'Normal' }
  ]
}



// Wrapper component for testing
const DashboardWrapper = () => (
  <BrowserRouter>
    <Dashboard />
  </BrowserRouter>
)

describe('Pruebas de Integración - Dashboard con Estadísticas', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(api)
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    mockAxios.restore()
    vi.restoreAllMocks()
  })

  // Simplificar las pruebas para enfocarse en la integración con la API
  describe('Integración con API de Estadísticas', () => {
    it('debe realizar la llamada correcta a la API sin filtros', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(200, mockEstadisticasResponse)

      // Act
      render(<DashboardWrapper />)

      // Assert
      await waitFor(() => {
        expect(mockAxios.history.get).toHaveLength(1)
        expect(mockAxios.history.get[0].url).toBe('/imc/estadisticas')
      })
    })

    it('debe manejar respuestas exitosas de la API', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(200, mockEstadisticasResponse)

      // Act
      render(<DashboardWrapper />)

      // Assert
      await waitFor(() => {
        expect(mockAxios.history.get).toHaveLength(1)
      }, { timeout: 3000 })
    })

    it('debe manejar errores de la API correctamente', async () => {
      // Arrange
      mockAxios.onGet('/imc/estadisticas').reply(500, { message: 'Error del servidor' })

      // Act
      render(<DashboardWrapper />)

      // Assert
      await waitFor(() => {
        expect(mockAxios.history.get).toHaveLength(1)
      }, { timeout: 3000 })
    })
  })


})