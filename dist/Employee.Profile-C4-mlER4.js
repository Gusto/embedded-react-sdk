const firstName = "Nombre legal";
const formTitle = "Formulario del empleado";
const lastName = "Apellido legal";
const middleInitial = "Inicial del segundo nombre";
const preferredFirstName = "Nombre de pila preferido";
const selfOnboardingDescription = "Tu empleado será invitado a ingresar su información en su propio tiempo.";
const ssnLabel = "Número de Seguro Social (9 dígitos)";
const ssnMask = "***-**-****";
const startDateDescription = "El primer día de trabajo de tu empleado en tu empresa.";
const successAlert = "Perfil actualizado correctamente";
const title = "Información básica";
const validations = { "email": "Se requiere un correo electrónico válido", "firstName": "Ingresa un nombre de pila válido", "lastName": "Ingresa un apellido válido", "startDate": "Selecciona una fecha de inicio válida", "startDateOutOfRange": "Un empleado debe tener una fecha de inicio que sea dentro de los próximos seis meses a partir de hoy." };
const workAddressSectionTitle = "Dirección de trabajo";
const Employee_Profile = {
  firstName,
  formTitle,
  lastName,
  middleInitial,
  preferredFirstName,
  selfOnboardingDescription,
  ssnLabel,
  ssnMask,
  startDateDescription,
  successAlert,
  title,
  validations,
  workAddressSectionTitle
};
export {
  Employee_Profile as default,
  firstName,
  formTitle,
  lastName,
  middleInitial,
  preferredFirstName,
  selfOnboardingDescription,
  ssnLabel,
  ssnMask,
  startDateDescription,
  successAlert,
  title,
  validations,
  workAddressSectionTitle
};
