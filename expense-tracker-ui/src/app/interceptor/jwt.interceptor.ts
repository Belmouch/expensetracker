import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { TimeoutError, timer, throwError } from 'rxjs';
import { finalize, retry, timeout } from 'rxjs/operators';

import { ConnectionStatusService } from '../services/connection-status.service';

const MAX_RETRIES = 4;
const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000];

function isRetryableRequest(req: HttpRequest<unknown>): boolean {
  return ['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
}

function isTemporaryBackendError(error: unknown): boolean {
  return (
    error instanceof TimeoutError ||
    (error instanceof HttpErrorResponse &&
      (error.status === 0 || [502, 503, 504].includes(error.status)))
  );
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const connectionStatus = inject(ConnectionStatusService);

  const token = (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  )
    ? window.localStorage.getItem('token')
    : null;

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  let retrying = false;

  const request$ = isRetryableRequest(req)
    ? next(req).pipe(timeout({ each: 15000 }))
    : next(req);

  return request$.pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        if (!isTemporaryBackendError(error)) {
          return throwError(() => error);
        }

        if (!retrying) {
          retrying = true;
          connectionStatus.startRetry();
        }

        return timer(RETRY_DELAYS_MS[retryCount - 1] ?? 8000);
      }
    }),
    finalize(() => {
      if (retrying) {
        connectionStatus.endRetry();
      }
    })
  );
};
