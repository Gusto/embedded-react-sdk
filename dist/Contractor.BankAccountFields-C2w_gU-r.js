const nameLabel = "Apodo de la cuenta";
const routingNumberDescription = "9 dígitos, en la parte inferior izquierda de un cheque";
const validations = { "accountName": "El apodo de la cuenta es obligatorio", "accountNumber": "Ingresa un número de cuenta válido", "accountNumberFormat": "Ingresa un número de cuenta válido", "routingNumber": "Ingresa un número de ruta válido de 9 dígitos" };
const Contractor_BankAccountFields = {
  nameLabel,
  routingNumberDescription,
  validations
};
export {
  Contractor_BankAccountFields as default,
  nameLabel,
  routingNumberDescription,
  validations
};
