const bankAccountForm = { "nameLabel": "Nombre de la cuenta", "routingNumberDescription": "9 dígitos", "validations": { "accountName": "Se requiere el nombre de la cuenta", "accountNumber": "Ingresa un número de cuenta válido", "routingNumber": "Se requiere el número de ruta (9 dígitos)" } };
const checkDescription = "Si seleccionas cheque como método de pago, tendrás que escribir un cheque físico a este empleado en cada día de pago.";
const checkLabel = "Cheque";
const directDepositDescription = "Recomendamos el depósito directo: depositaremos los cheques de pago directamente en la cuenta bancaria de tu empleado.";
const directDepositLabel = "Depósito directo";
const submittingCta = "Guardando…";
const title = "Detalles de pago del contratista";
const Contractor_PaymentMethod = {
  bankAccountForm,
  checkDescription,
  checkLabel,
  directDepositDescription,
  directDepositLabel,
  submittingCta,
  title
};
export {
  bankAccountForm,
  checkDescription,
  checkLabel,
  Contractor_PaymentMethod as default,
  directDepositDescription,
  directDepositLabel,
  submittingCta,
  title
};
