const blankStockDescription = "Use este tipo de cheques si tiene cheques en blanco y necesita que completemos la información de su empresa y banco. El cheque físico siempre estará en la parte inferior del PDF del cheque.";
const blankStockLabel = "Cheques en blanco";
const customStockDescription = "Use este tipo de cheques si tiene cheques preimpresos con la información de su empresa y banco. El cheque físico aparecerá en la parte superior del PDF del cheque. Los números de cheque ya deben estar preimpresos en los cheques que compró.";
const customStockLabel = "Cheques personalizados";
const modalTitle = "Elija el tipo de cheques";
const startingCheckNumberDescription = "Este será el primer número de cheque; todos los demás cheques seguirán en orden secuencial.";
const startingCheckNumberLabel = "El número de cheque comienza con";
const submitCta = "Ver cheques";
const submitCtaLoading = "Generando...";
const validations = { "startingCheckNumber": "Ingresa un número de cheque válido" };
const Payroll_PrintChecksForm = {
  blankStockDescription,
  blankStockLabel,
  customStockDescription,
  customStockLabel,
  modalTitle,
  startingCheckNumberDescription,
  startingCheckNumberLabel,
  submitCta,
  submitCtaLoading,
  validations
};
export {
  blankStockDescription,
  blankStockLabel,
  customStockDescription,
  customStockLabel,
  Payroll_PrintChecksForm as default,
  modalTitle,
  startingCheckNumberDescription,
  startingCheckNumberLabel,
  submitCta,
  submitCtaLoading,
  validations
};
