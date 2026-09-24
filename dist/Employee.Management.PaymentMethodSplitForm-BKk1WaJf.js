const amountLabel = "Monto fijo";
const draggableListLabel = "Lista reordenable de cuentas bancarias";
const percentageLabel = "Porcentaje";
const remainderLabel = "Remanente";
const splitAmountLabel = "{{name}} ({{account_number}})";
const splitByLabel = "Dividir por";
const splitDescription = 'Puedes dividir tu cheque de pago en diferentes cuentas por porcentaje o por montos fijos en dólares. Al dividir por monto, puedes reordenar la prioridad de las cuentas bancarias haciendo clic y arrastrando el ícono de lista a la izquierda del campo de cuenta bancaria. Pagaremos los montos en el orden especificado hasta que tu salario haya sido distribuido por completo a la última cuenta de "remanente".';
const validations = { "amountError": "Ingresa un monto válido", "percentageAmountError": "El porcentaje debe ser un número entero entre 0 y 100", "percentageErrorWithTotal": "Las divisiones deben sumar el 100 %. Actualmente {{total}} %." };
const Employee_Management_PaymentMethodSplitForm = {
  amountLabel,
  draggableListLabel,
  percentageLabel,
  remainderLabel,
  splitAmountLabel,
  splitByLabel,
  splitDescription,
  validations
};
export {
  amountLabel,
  Employee_Management_PaymentMethodSplitForm as default,
  draggableListLabel,
  percentageLabel,
  remainderLabel,
  splitAmountLabel,
  splitByLabel,
  splitDescription,
  validations
};
