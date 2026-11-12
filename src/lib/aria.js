/** id + aria wiring for a form control that may show an error message. */
export const describe = (id, error) => ({
  id,
  "aria-invalid": error ? "true" : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});
