const actionColumn = "Acciones de la cuenta bancaria";
const addAnotherCta = "+ Agregar otra cuenta bancaria";
const allocationColumn = "Asignación";
const amountLabel = "Monto fijo";
const bankAccountsListLabel = "Lista de cuentas bancarias de empleados";
const bankFormSuccessAlert = "La cuenta bancaria se agregó correctamente";
const checkDescription = "Si seleccionas cheque como método de pago, tendrás que emitir un cheque físico a este empleado cada día de pago.";
const checkDescriptionSelf = "Si seleccionas cheque como método de pago, recibirás un cheque físico.";
const checkLabel = "Cheque";
const deleteBankAccountDialog = { "description": "¿Estás seguro de que deseas eliminar la cuenta bancaria {{account}}?", "title": "Eliminar cuenta bancaria" };
const deleteBankAccountSuccessAlert = "La cuenta bancaria {{account}} fue eliminada";
const directDepositDescriptionSelf = "Recomendamos el depósito directo: podemos depositar tus cheques de pago directamente en tu cuenta.";
const directDepositLabel = "Depósito directo";
const draggableListLabel = "Lista reordenable de cuentas bancarias";
const hamburgerTitle = "Acciones de la cuenta bancaria";
const managementTitle = "Pago";
const nameLabel = "Nombre de la cuenta";
const nicknameColumn = "Nombre";
const percentageLabel = "Porcentaje";
const priorityLabel = "Prioridad";
const priority_few = "{{count}}.";
const priority_one = "{{count}}.";
const priority_other = "{{count}}.";
const priority_two = "{{count}}º";
const remainderLabel = "Restante";
const routingNumberDescription = "(9 dígitos)";
const splitAmountLabel = "{{name}} ({{account_number}})";
const splitByLabel = "Dividir por";
const splitDescription = 'Puedes dividir tu cheque de pago en diferentes cuentas por porcentaje o por montos fijos en dólares. Al dividir por monto, puedes cambiar el orden de prioridad de las cuentas bancarias haciendo clic y arrastrando el ícono de la lista a la izquierda del campo de la cuenta bancaria. Pagaremos los montos en el orden indicado hasta que tu salario se haya distribuido por completo a la última cuenta de "remanente".';
const splitViewSuccessAlert = "La división del pago se actualizó correctamente";
const validations = { "accountName": "El nombre de la cuenta es obligatorio", "accountNumber": "El número de cuenta es un campo obligatorio", "accountNumberFormat": "El número de cuenta solo debe contener dígitos (hasta 17)", "amountError": "Ingresa un monto válido", "percentageAmountError": "El porcentaje debe ser un número entero entre 0 y 100", "percentageError": "Si el monto del método de pago se divide por porcentaje, todos los montos divididos deben sumar exactamente 100.", "percentageErrorWithTotal": "Las divisiones deben sumar 100 %. Actualmente van en {{total}} %.", "routingNumber": "El número de ruta debe ser numérico (9 dígitos)" };
const Employee_PaymentMethod = {
  actionColumn,
  addAnotherCta,
  allocationColumn,
  amountLabel,
  bankAccountsListLabel,
  bankFormSuccessAlert,
  checkDescription,
  checkDescriptionSelf,
  checkLabel,
  deleteBankAccountDialog,
  deleteBankAccountSuccessAlert,
  directDepositDescriptionSelf,
  directDepositLabel,
  draggableListLabel,
  hamburgerTitle,
  managementTitle,
  nameLabel,
  nicknameColumn,
  percentageLabel,
  priorityLabel,
  priority_few,
  priority_one,
  priority_other,
  priority_two,
  remainderLabel,
  routingNumberDescription,
  splitAmountLabel,
  splitByLabel,
  splitDescription,
  splitViewSuccessAlert,
  validations
};
export {
  actionColumn,
  addAnotherCta,
  allocationColumn,
  amountLabel,
  bankAccountsListLabel,
  bankFormSuccessAlert,
  checkDescription,
  checkDescriptionSelf,
  checkLabel,
  Employee_PaymentMethod as default,
  deleteBankAccountDialog,
  deleteBankAccountSuccessAlert,
  directDepositDescriptionSelf,
  directDepositLabel,
  draggableListLabel,
  hamburgerTitle,
  managementTitle,
  nameLabel,
  nicknameColumn,
  percentageLabel,
  priorityLabel,
  priority_few,
  priority_one,
  priority_other,
  priority_two,
  remainderLabel,
  routingNumberDescription,
  splitAmountLabel,
  splitByLabel,
  splitDescription,
  splitViewSuccessAlert,
  validations
};
