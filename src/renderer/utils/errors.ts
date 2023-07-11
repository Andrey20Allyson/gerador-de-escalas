import type { AppError } from "../../app/api/channels";

export function isAppError(value: unknown): value is AppError {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'app-error';
}

export function showAppError(error: AppError, alert = true) {
  console.error(`${error.message}\n${error.callstack}`);

  if (alert) {
    window.alert(error.message);
  }
}