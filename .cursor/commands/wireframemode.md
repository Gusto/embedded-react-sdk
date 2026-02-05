# Wireframe Mode

Switch into wireframe prototyping mode for rough UI exploration. This mode helps designers prototype without producing code that looks production-ready.

## Rules while in wireframe mode

1. **Stub out UI components** - Don't implement components fully. Use placeholder wrappers with TODO comments:

   ```tsx
   {
     /* TODO: Implement <ComponentName> - brief description of what it does */
   }
   ```

2. **Never guess form expectations** - Don't assume field values, validation rules, select options, or copy. Leave explicit TODOs:

   ```tsx
   <SelectField
     name="fieldName"
     label="TODO: Confirm label"
     options={[]} // TODO: Get options from design/PM
   />
   ```

3. **Use placeholder copy** - Don't write real copy or labels:

   ```tsx
   <Heading as="h1">TODO: Copy needed</Heading>
   <Text>TODO: Description copy needed</Text>
   ```

4. **Focus on structure, not polish** - Keep component hierarchy and layout but skip styling details

5. **Make incompleteness obvious** - The goal is for other engineers to immediately see this is WIP, not finished work

## Exiting wireframe mode

Say `/normalmode` or explicitly ask to exit wireframe mode to return to normal coding behavior.
