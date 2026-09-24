const landingSubtitle = "Hi, {{firstName}}. Welcome to {{companyName}}!";
const landingDescription = "Let's get you onboarded so you can get paid. This process usually takes about 8 minutes.";
const stepsSubtitle = "What you'll need:";
const steps = { "personalInfo": "Your personal information (home address, SSN)", "taxInfo": "Tax withholding information (we'll help you figure this one out)", "bankInfo": "Your bank information (account and routing numbers)" };
const getStartedCta = "Let's get started";
const Employee_Landing = {
  landingSubtitle,
  landingDescription,
  stepsSubtitle,
  steps,
  getStartedCta
};
export {
  Employee_Landing as default,
  getStartedCta,
  landingDescription,
  landingSubtitle,
  steps,
  stepsSubtitle
};
