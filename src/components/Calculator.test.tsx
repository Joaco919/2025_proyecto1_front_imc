import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Calculator from './Calculator'
import { useAuth } from './AuthContext'
import * as api from '../utils/api'

// Mock dependencies
vi.mock('./AuthContext')
vi.mock('../utils/api')

const mockUseAuth = vi.mocked(useAuth)
const mockCalcularIMC = vi.mocked(api.calcularIMC)

// Wrapper component for Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Calculator Component', () => {
  const mockAuth = {
    isAuthenticated: true,
    user: { email: 'test@example.com' },
    token: 'test-token',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue(mockAuth)
  })

  it('should render calculator form', () => {
    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    expect(screen.getByLabelText(/altura/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/peso/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calcular imc/i })).toBeInTheDocument()
  })

  it('should validate empty fields', async () => {
    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText(/ingresa tu altura/i)).toBeInTheDocument()
      expect(screen.getByText(/ingresa tu peso/i)).toBeInTheDocument()
    })
  })

  it('should validate invalid altura', async () => {
    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const alturaInput = screen.getByLabelText(/altura/i)
    const pesoInput = screen.getByLabelText(/peso/i)
    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })

    fireEvent.change(alturaInput, { target: { value: '0' } })
    fireEvent.change(pesoInput, { target: { value: '70' } })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText(/la altura debe ser > 0 y < 3 metros/i)).toBeInTheDocument()
    })
  })

  it('should validate invalid peso', async () => {
    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const alturaInput = screen.getByLabelText(/altura/i)
    const pesoInput = screen.getByLabelText(/peso/i)
    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })

    fireEvent.change(alturaInput, { target: { value: '1.75' } })
    fireEvent.change(pesoInput, { target: { value: '0' } })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText(/el peso debe ser > 0 y < 500 kg/i)).toBeInTheDocument()
    })
  })

  it('should calculate IMC successfully', async () => {
    const mockResult = {
      imc: 22.86,
      categoria: 'Normal'
    }
    mockCalcularIMC.mockResolvedValue(mockResult)

    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const alturaInput = screen.getByLabelText(/altura/i)
    const pesoInput = screen.getByLabelText(/peso/i)
    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })

    fireEvent.change(alturaInput, { target: { value: '1.75' } })
    fireEvent.change(pesoInput, { target: { value: '70' } })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText('22.86')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
    })

    expect(mockCalcularIMC).toHaveBeenCalledWith(1.75, 70)
  })

  it('should handle calculation error', async () => {
    const errorMessage = 'Error al calcular IMC'
    mockCalcularIMC.mockRejectedValue(new Error(errorMessage))

    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const alturaInput = screen.getByLabelText(/altura/i)
    const pesoInput = screen.getByLabelText(/peso/i)
    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })

    fireEvent.change(alturaInput, { target: { value: '1.75' } })
    fireEvent.change(pesoInput, { target: { value: '70' } })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should handle decimal values correctly in calculations', async () => {
    // Test que verifica que el cálculo maneja correctamente decimales
    // La conversión de comas está probada en validations.test.ts
    
    const mockResult = {
      imc: 22.86,
      categoria: 'Normal'
    }
    mockCalcularIMC.mockResolvedValue(mockResult)

    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const alturaInput = screen.getByLabelText(/altura/i)
    const pesoInput = screen.getByLabelText(/peso/i)
    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })

    // Usar valores decimales válidos (el navegador acepta puntos en inputs number)
    fireEvent.change(alturaInput, { target: { value: '1.75' } })
    fireEvent.change(pesoInput, { target: { value: '70.5' } })
    
    fireEvent.click(calculateButton)

    // Verificar que se llamó al API con los valores correctos
    await waitFor(() => {
      expect(mockCalcularIMC).toHaveBeenCalledWith(1.75, 70.5)
    })
    
    // Verificar que aparece el resultado
    await waitFor(() => {
      expect(screen.getByText('22.86')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
    })
  })

  it('should show loading state during calculation', async () => {
    // Mock a delayed response
    mockCalcularIMC.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ imc: 22.86, categoria: 'Normal' }), 100)
    }))

    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const alturaInput = screen.getByLabelText(/altura/i)
    const pesoInput = screen.getByLabelText(/peso/i)
    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })

    fireEvent.change(alturaInput, { target: { value: '1.75' } })
    fireEvent.change(pesoInput, { target: { value: '70' } })
    fireEvent.click(calculateButton)

    // Should show loading state
    expect(screen.getByRole('button', { name: /calculando/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /calcular imc/i })).toBeInTheDocument()
    })
  })

  it('should clear previous results when recalculating', async () => {
    const mockResult1 = { imc: 22.86, categoria: 'Normal' }
    const mockResult2 = { imc: 25.00, categoria: 'Sobrepeso' }
    
    mockCalcularIMC
      .mockResolvedValueOnce(mockResult1)
      .mockResolvedValueOnce(mockResult2)

    render(
      <RouterWrapper>
        <Calculator />
      </RouterWrapper>
    )

    const alturaInput = screen.getByLabelText(/altura/i)
    const pesoInput = screen.getByLabelText(/peso/i)
    const calculateButton = screen.getByRole('button', { name: /calcular imc/i })

    // First calculation
    fireEvent.change(alturaInput, { target: { value: '1.75' } })
    fireEvent.change(pesoInput, { target: { value: '70' } })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText('22.86')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
    })

    // Second calculation
    fireEvent.change(pesoInput, { target: { value: '77' } })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText('25.00')).toBeInTheDocument()
      expect(screen.getByText('Sobrepeso')).toBeInTheDocument()
    })

    // Should not show previous result
    expect(screen.queryByText('22.86')).not.toBeInTheDocument()
    expect(screen.queryByText('Normal')).not.toBeInTheDocument()
  })
})