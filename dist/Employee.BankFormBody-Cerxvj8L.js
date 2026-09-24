const nameLabel = "Apodo de la cuenta";
const routingNumberDescription = "(9 dígitos)";
const validations = { "accountName": "Se requiere el nombre de la cuenta", "accountNumber": "El número de cuenta es un campo obligatorio", "accountNumberFormat": "El número de cuenta solo debe contener dígitos (hasta 17)", "routingNumber": "El número de ruta debe ser un número (9 dígitos)" };
const Employee_BankFormBody = {
  nameLabel,
  routingNumberDescription,
  validations
};
export {
  Employee_BankFormBody as default,
  nameLabel,
  routingNumberDescription,
  validations
};
