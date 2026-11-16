import { AbstractControl, ValidationErrors } from '@angular/forms';

const NAME_PATTERN = /^[\p{L}\p{M}\s'.-]+$/u;

export function nameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length < 2 || !NAME_PATTERN.test(trimmed)) {
    return { invalidName: true };
  }

  return null;
}
