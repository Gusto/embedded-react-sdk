const applyCta = "Aplicar";
const calculateCta = "Calcular";
const calculatingCta = "Calculando...";
const description = "Ingresa el monto neto que quieres que reciba este empleado. Luego calcularemos automáticamente el monto bruto que debes pagar, incluyendo impuestos y deducciones.";
const errorMessage = "No se puede calcular el incremento bruto. Inténtalo de nuevo.";
const grossPayResult = "Pago bruto calculado";
const netPayLabel = "Importe neto";
const title = "Ingresa un monto neto";
const validations = { "netPay": "El importe neto debe ser mayor que cero centavos" };
const warning = "Esto reemplazará cualquier monto ingresado anteriormente.";
const Payroll_GrossUpModal = {
  applyCta,
  calculateCta,
  calculatingCta,
  description,
  errorMessage,
  grossPayResult,
  netPayLabel,
  title,
  validations,
  warning
};
export {
  applyCta,
  calculateCta,
  calculatingCta,
  Payroll_GrossUpModal as default,
  description,
  errorMessage,
  grossPayResult,
  netPayLabel,
  title,
  validations,
  warning
};
