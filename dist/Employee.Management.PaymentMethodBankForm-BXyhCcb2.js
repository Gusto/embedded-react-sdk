const nameLabel = "Nombre de la cuenta";
const routingNumberDescription = "(9 dígitos)";
const validations = { "accountName": "El nombre de la cuenta es obligatorio", "accountNumber": "El número de cuenta es un campo obligatorio", "accountNumberFormat": "El número de cuenta solo debe contener dígitos (hasta 17)", "routingNumber": "El número de ruta debe ser un número (9 dígitos)" };
const Employee_Management_PaymentMethodBankForm = {
  nameLabel,
  routingNumberDescription,
  validations
};
export {
  Employee_Management_PaymentMethodBankForm as default,
  nameLabel,
  routingNumberDescription,
  validations
};
