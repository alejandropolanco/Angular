import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const errors: ValidationErrors = {};

  if (!/[A-Za-z]/.test(value)) {
    errors['missingLetter'] = true;
  }

  if (!/[0-9]/.test(value)) {
    errors['missingNumber'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export const passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
  const password = group.get('password')?.value;
  const confirmation = group.get('confirmPassword')?.value;

  if (!password || !confirmation) {
    return null;
  }

  return password === confirmation ? null : { passwordMismatch: true };
};

export interface PasswordStrength {
  level: 'empty' | 'weak' | 'medium' | 'strong';
  label: string;
  score: number;
  maxScore: number;
}

export function evaluatePasswordStrength(value: string): PasswordStrength {
  const maxScore = 5;

  if (!value) {
    return { level: 'empty', label: 'Sin contraseña', score: 0, maxScore };
  }

  let score = 0;

  if (value.length >= 8) {
    score += 1;
  }

  if (value.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
    score += 1;
  }

  if (/[0-9]/.test(value)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(value)) {
    score += 1;
  }

  if (score <= 2) {
    return { level: 'weak', label: 'Débil', score, maxScore };
  }

  if (score === 3) {
    return { level: 'medium', label: 'Media', score, maxScore };
  }

  return { level: 'strong', label: 'Fuerte', score, maxScore };
}
