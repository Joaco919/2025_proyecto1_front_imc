import axios from "axios";
import React, { useState } from "react";

interface ImcResult {
  imc: number;
  categoria: string;
}

type FieldErrors = {
  altura?: string;
  peso?: string;
  general?: string;
};

function ImcForm() {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Permite usar coma o punto: "1,75" -> 1.75
  const toNumber = (v: string) => parseFloat(v.replace(",", "."));

  const validateAltura = (v: string): string | undefined => {
    if (!v.trim()) return "Ingresa tu altura en metros (ej.: 1.75).";
    const n = toNumber(v);
    if (isNaN(n)) return "La altura debe ser numérica (ej.: 1.75).";
    // Regla: mayor a 0 y menor a 3 metros
    if (!(n > 0 && n < 3)) return "La altura debe ser > 0 y < 3 metros.";
  };

  const validatePeso = (v: string): string | undefined => {
    if (!v.trim()) return "Ingresa tu peso en kg (ej.: 70.5).";
    const n = toNumber(v);
    if (isNaN(n)) return "El peso debe ser numérico (ej.: 70.5).";
    // Regla: mayor a 0 y menor a 500 kg
    if (!(n > 0 && n < 500)) return "El peso debe ser > 0 y < 500 kg.";
  };

  const validateForm = (alturaStr: string, pesoStr: string) => {
    const newErrors: FieldErrors = {
      altura: validateAltura(alturaStr),
      peso: validatePeso(pesoStr),
    };
    setErrors(newErrors);
    return !newErrors.altura && !newErrors.peso;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(null);
    setErrors({}); // se repoblará si hay errores

    if (!validateForm(altura, peso)) return;

    const alturaNum = toNumber(altura);
    const pesoNum = toNumber(peso);

    try {
      const response = await axios.post(
        "https://two025-proyecto1-back-imc-vlxv.onrender.com/imc/calcular",
        { altura: alturaNum, peso: pesoNum }
      );
      setResultado(response.data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        "No pudimos calcular el IMC. Revisa tu conexión o si el backend está disponible.";
      setErrors({ general: message });
      setResultado(null);
    }
  };

  // Validación inmediata por campo (opcional, mejora UX)
  const onAlturaChange = (v: string) => {
    setAltura(v);
    if (errors.altura) {
      setErrors((prev) => ({ ...prev, altura: validateAltura(v) }));
    }
  };
  const onPesoChange = (v: string) => {
    setPeso(v);
    if (errors.peso) {
      setErrors((prev) => ({ ...prev, peso: validatePeso(v) }));
    }
  };

  return (
    <div>
      <div className="form-context">
        <img src="/grupo12.jpg" alt="Grupo12" className="grupo" />
        <h1>Calculadora de IMC</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 12 }}>
            <label>Altura (m):</label>
            <input
              type="number"
              value={altura}
              onChange={(e) => onAlturaChange(e.target.value)}
              onBlur={(e) =>
                setErrors((prev) => ({
                  ...prev,
                  altura: validateAltura(e.target.value),
                }))
              }
              step="0.01"
              min="0.01"
              max="2.99"
              aria-invalid={!!errors.altura}
              aria-describedby="altura-error"
            />
            {errors.altura && (
              <small id="altura-error" style={{ color: "red", display: "block" }}>
                {errors.altura}
              </small>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Peso (kg):</label>
            <input
              type="number"
              value={peso}
              onChange={(e) => onPesoChange(e.target.value)}
              onBlur={(e) =>
                setErrors((prev) => ({
                  ...prev,
                  peso: validatePeso(e.target.value),
                }))
              }
              step="0.1"
              min="0.1"
              max="499.9"
              aria-invalid={!!errors.peso}
              aria-describedby="peso-error"
            />
            {errors.peso && (
              <small id="peso-error" style={{ color: "red", display: "block" }}>
                {errors.peso}
              </small>
            )}
          </div>

          <button type="submit">Calcular</button>
        </form>

        {resultado && (
          <div style={{ marginTop: 16 }}>
            <p>IMC: {resultado.imc.toFixed(2)}</p>
            <p>Categoría: {resultado.categoria}</p>
          </div>
        )}

        {errors.general && (
          <div style={{ marginTop: 12 }}>
            <p style={{ color: "red" }}>{errors.general}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImcForm;
