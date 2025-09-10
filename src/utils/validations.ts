

// Convierte coma a punto y devuelve número
export const toNumber = (v: string): number =>
  parseFloat(v.replace(",", "."));

// Validación de altura
export const validateAltura = (v: string): string | undefined => {
  if (!v.trim()) return "Ingresa tu altura en metros (ej.: 1.75).";
  const n = toNumber(v);
  if (isNaN(n)) return "La altura debe ser numérica (ej.: 1.75).";
  if (!(n > 0 && n < 3)) return "La altura debe ser > 0 y < 3 metros.";
};

// Validación de peso
export const validatePeso = (v: string): string | undefined => {
  if (!v.trim()) return "Ingresa tu peso en kg (ej.: 70.5).";
  const n = toNumber(v);
  if (isNaN(n)) return "El peso debe ser numérico (ej.: 70.5).";
  if (!(n > 0 && n < 500)) return "El peso debe ser > 0 y < 500 kg.";
};
