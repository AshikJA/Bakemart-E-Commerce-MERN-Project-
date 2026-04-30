import { useState, useCallback } from 'react';

/**
 * useFormErrors — lightweight hook for field-level validation error display.
 *
 * Usage:
 *   const { fieldError, setApiErrors, clearErrors } = useFormErrors();
 *   ...
 *   try {
 *     await api.post('/auth/register', form);
 *   } catch (err) {
 *     setApiErrors(err);          // reads err.response.data.details
 *   }
 *   ...
 *   <input name="email" />
 *   <FieldError error={fieldError('email')} />
 */
export function useFormErrors() {
  const [errors, setErrors] = useState({});   // { fieldName: 'message text' }

  /**
   * Parse the axios error response and store field → message pairs.
   * Also accepts a plain { field, message }[] array.
   */
  const setApiErrors = useCallback((errOrDetails) => {
    let details;

    if (Array.isArray(errOrDetails)) {
      details = errOrDetails;
    } else {
      details = errOrDetails?.response?.data?.details;
    }

    if (!details || !Array.isArray(details)) return;

    const map = {};
    details.forEach(({ field, message }) => {
      if (field && message) map[field] = message;
    });
    setErrors(map);
  }, []);

  /** Return the error message for a specific field, or empty string. */
  const fieldError = useCallback((name) => errors[name] || '', [errors]);

  /** Clear a single field error (useful on input change). */
  const clearField = useCallback((name) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  /** Clear all field errors. */
  const clearErrors = useCallback(() => setErrors({}), []);

  return { fieldError, setApiErrors, clearErrors, clearField, errors };
}

/**
 * FieldError — tiny presentational component to render below inputs.
 *
 * Usage:
 *   <FieldError error={fieldError('email')} />
 */
export function FieldError({ error }) {
  if (!error) return null;
  return (
    <p className="mt-1 ml-1 text-[11px] font-bold text-red-500 flex items-center gap-1">
      <span>⚠</span> {error}
    </p>
  );
}
