// core/global-error.handler.ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

function isAbortError(error: unknown, seen = new Set<object>()): boolean {
  if (typeof error === 'string') {
    return /AbortError|operation was aborted|request .* was aborted/i.test(error);
  }
  if (error === null || typeof error !== 'object' || seen.has(error)) return false;

  seen.add(error);
  const value = error as {
    name?: unknown;
    code?: unknown;
    message?: unknown;
    cause?: unknown;
    rejection?: unknown;
    originalError?: unknown;
  };

  if (
    value.name === 'AbortError' ||
    value.code === 'ABORT_ERR' ||
    (typeof value.message === 'string' &&
      /AbortError|operation was aborted|request .* was aborted/i.test(value.message))
  ) {
    return true;
  }

  return (
    isAbortError(value.cause, seen) ||
    isAbortError(value.rejection, seen) ||
    isAbortError(value.originalError, seen)
  );
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly router = inject(Router);

  handleError(error: unknown): void {
    // Route transitions cancel pending fetches by design; that is not a page error.
    if (isAbortError(error)) return;

    console.error(error);
    void this.router.navigateByUrl('/error');
  }
}
