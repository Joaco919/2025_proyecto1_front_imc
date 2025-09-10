import axios from "axios";

export interface ImcResult {
  imc: number;
  categoria: string;
}

/**
 * Llama al backend para calcular el IMC
 * @param altura Altura en metros
 * @param peso Peso en kg
 * @returns Objeto con imc y categoría
 */
export const calcularIMC = async (altura: number, peso: number): Promise<ImcResult> => {
  try {
    const response = await axios.post(
      "https://two025-proyecto1-back-imc-vlxv.onrender.com/imc/calcular",
      { altura, peso }
    );
    return response.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ??
      "No pudimos calcular el IMC. Revisa tu conexión o si el backend está disponible.";
    throw new Error(message);
  }
};