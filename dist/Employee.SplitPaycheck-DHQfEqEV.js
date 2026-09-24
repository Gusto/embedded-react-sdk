const percentageLabel = "Porcentaje";
const priorityLabel = "Prioridad";
const priority_few = "{{count}}º";
const priority_one = "{{count}}º";
const priority_other = "{{count}}.º";
const priority_two = "{{count}}.º";
const remainderLabel = "Selecciona si esta cuenta recibirá cualquier pago restante";
const splitAmountLabel = "Dividir monto";
const splitByLabel = "Dividir por";
const validations = { "amountError": "Ingresa un monto válido", "percentageError": "Si el monto del método de pago se divide por porcentaje, todos los montos divididos deben sumar exactamente 100.", "priorityError": "Las prioridades deben ser secuenciales" };
const Employee_SplitPaycheck = {
  percentageLabel,
  priorityLabel,
  priority_few,
  priority_one,
  priority_other,
  priority_two,
  remainderLabel,
  splitAmountLabel,
  splitByLabel,
  validations
};
export {
  Employee_SplitPaycheck as default,
  percentageLabel,
  priorityLabel,
  priority_few,
  priority_one,
  priority_other,
  priority_two,
  remainderLabel,
  splitAmountLabel,
  splitByLabel,
  validations
};
