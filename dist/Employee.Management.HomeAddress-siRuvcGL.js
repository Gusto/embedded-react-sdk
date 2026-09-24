const card = { "manageCta": "Administrar", "noAddress": "No hay una dirección de domicilio en el archivo" };
const changeCta = "Cambiar domicilio";
const changePendingDescription = "La dirección de domicilio de {{possessiveLabel}} cambiará a {{newAddress}} el {{effectiveDate}}.";
const changePendingPossessiveFallback = "De este empleado";
const changePendingTitle = "Cambio pendiente";
const columns = { "address": "Dirección", "endDate": "Fecha de finalización" };
const createModalDescription = "Ingresa el nuevo domicilio y cuándo entra en vigor. Esta información se usa para nómina, beneficios y recursos humanos, así que asegúrate de que sea correcta.";
const createModalTitle = "Agregar una nueva dirección de casa";
const currentSectionTitle = "Domicilio actual";
const currentSince = "Desde {{date}}";
const deleteModalDescription = "Eliminar una dirección no se puede deshacer. <strong>{{address}}</strong> se eliminará. Esto puede tener implicaciones en tus cálculos y retenciones de impuestos.";
const deleteModalTitle = "¿Eliminar domicilio?";
const description = "La dirección de domicilio de un empleado se usa para calcular sus impuestos y determinar la elegibilidad para ciertos beneficios. Asegúrate de mantenerla actualizada.";
const editModalDescription = "Actualiza el domicilio actual de esta persona empleada. Esta información se usa para nómina, beneficios y recursos humanos, así que asegúrate de que sea correcta.";
const editModalTitle = "Editar dirección de casa";
const form = { "courtesyWithholdingDescription": "Retén y paga los impuestos locales sobre los ingresos de los empleados que viven y trabajan en distintos estados. ", "learnMoreCta": '<LearnMoreLink href="https://support.gusto.com/article/101365481100000/Reciprocal-agreements-and-courtesy-withholding" target="_blank">Obtén más información sobre las retenciones de cortesía.</LearnMoreLink>', "startDateRequired": "La fecha de inicio es obligatoria", "statePlaceholder": "Selecciona un estado...", "street2": "Calle 2", "validations": { "city": "Proporciona un nombre de ciudad válido", "state": "Selecciona un estado", "street1": "La dirección es obligatoria", "zip": "Proporciona un código postal válido" }, "withholdingNote": "<p>Realizar retenciones en nombre de una persona empleada requerirá que tu empresa se registre ante las agencias correspondientes.</p><p>Además, si el domicilio de esta persona empleada cambia los requisitos de impuestos estatales de tu empresa, es posible que debas completar de nuevo la configuración de impuestos estatales de tu empresa.</p>", "withholdingTitle": "Retención de cortesía" };
const historyEmptyDescription = "Una vez que esta persona empleada haya tenido más de un domicilio, sus direcciones anteriores aparecerán en esta lista.";
const historyEmptyTitle = "Aún no hay historial de domicilios";
const historySectionTitle = "Historial de domicilios";
const rowMenuAriaLabel = "Abrir acciones de fila de dirección";
const startDateHelper = "La fecha en que el empleado comenzó a vivir en esta dirección.";
const submitErrorAlertFallback = "No se pudo verificar la dirección.";
const submitErrorAlertHelp = "Verifica bien la calle, la ciudad, el estado y el código postal. Si se ven correctos, es posible que el Servicio Postal de EE. UU. (USPS) no reconozca la dirección; intenta con una dirección válida cercana o comunícate con tu administrador.";
const submitErrorAlertTitle = "No pudimos guardar esta dirección";
const title = "Administrar la dirección de domicilio";
const Employee_Management_HomeAddress = {
  card,
  changeCta,
  changePendingDescription,
  changePendingPossessiveFallback,
  changePendingTitle,
  columns,
  createModalDescription,
  createModalTitle,
  currentSectionTitle,
  currentSince,
  deleteModalDescription,
  deleteModalTitle,
  description,
  editModalDescription,
  editModalTitle,
  form,
  historyEmptyDescription,
  historyEmptyTitle,
  historySectionTitle,
  rowMenuAriaLabel,
  startDateHelper,
  submitErrorAlertFallback,
  submitErrorAlertHelp,
  submitErrorAlertTitle,
  title
};
export {
  card,
  changeCta,
  changePendingDescription,
  changePendingPossessiveFallback,
  changePendingTitle,
  columns,
  createModalDescription,
  createModalTitle,
  currentSectionTitle,
  currentSince,
  Employee_Management_HomeAddress as default,
  deleteModalDescription,
  deleteModalTitle,
  description,
  editModalDescription,
  editModalTitle,
  form,
  historyEmptyDescription,
  historyEmptyTitle,
  historySectionTitle,
  rowMenuAriaLabel,
  startDateHelper,
  submitErrorAlertFallback,
  submitErrorAlertHelp,
  submitErrorAlertTitle,
  title
};
