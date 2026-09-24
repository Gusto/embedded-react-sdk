const alerts = { "bankAccountAdded": "Cuenta bancaria agregada", "bankAccountRemoved": "Cuenta bancaria eliminada" };
const bankAccountListLabel = "Cuenta bancaria del contratista";
const checkLabel = "Cheque";
const form = { "nameLabel": "Apodo de la cuenta", "routingNumberDescription": "9 dígitos, en la parte inferior izquierda de un cheque", "validations": { "accountNumber": "Ingresa un número de cuenta válido", "name": "Se requiere el apodo de la cuenta", "routingNumber": "Ingresa un número de ruta válido de 9 dígitos" } };
const hamburgerTitle = "Acciones de la cuenta bancaria";
const nicknameColumn = "Apodo";
const removeBankAccountCta = "Eliminar cuenta";
const removeBankAccountDialog = { "description": "¿Estás seguro de que quieres eliminar la cuenta bancaria {{account}}? El método de pago del contratista volverá a Cheque.", "title": "Eliminar cuenta bancaria" };
const title = "Pago";
const Contractor_Management_PaymentMethod = {
  alerts,
  bankAccountListLabel,
  checkLabel,
  form,
  hamburgerTitle,
  nicknameColumn,
  removeBankAccountCta,
  removeBankAccountDialog,
  title
};
export {
  alerts,
  bankAccountListLabel,
  checkLabel,
  Contractor_Management_PaymentMethod as default,
  form,
  hamburgerTitle,
  nicknameColumn,
  removeBankAccountCta,
  removeBankAccountDialog,
  title
};
