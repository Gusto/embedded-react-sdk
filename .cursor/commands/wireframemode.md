# Wireframe Mode

Switch into wireframe prototyping mode for rough UI exploration. This mode helps designers prototype without producing code that looks production-ready.

## Rules while in wireframe mode

1. **Stub out UI components** - Start components but don't fill them in completely. Add a TODO comment so it's clear the component is a wireframe:

   ```tsx
   {
     /* TODO: Wireframe - <ComponentName> needs full implementation */
   }
   ;<ComponentName />
   ```

2. **Never guess form/api expectations** - Don't assume field values, validation rules, select options, or copy. Leave explicit TODOs:

   ```tsx
   <SelectField
     name="fieldName"
     label="TODO: Confirm label"
     options={[]} // TODO: Get options from design/PM
   />
   ```

3. **Use placeholder copy** - Don't write real copy or labels. If copy is added, ensure it's properly i18n'd:

   ```tsx
   <Heading as="h1">TODO: Copy needed (i18n)</Heading>
   <Text>TODO: Description copy needed (i18n)</Text>
   ```

4. **Focus on structure, not polish** - Keep component hierarchy and layout but skip styling details

5. **Make incompleteness obvious** - The goal is for other engineers to immediately see this is WIP, not finished work

## Exiting wireframe mode

Say `/normalmode` or explicitly ask to exit wireframe mode to return to normal coding behavior.
