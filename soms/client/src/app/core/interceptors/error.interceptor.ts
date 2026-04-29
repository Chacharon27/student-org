import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg =
        (err.error && (err.error.message as string)) ||
        err.message ||
        'Unexpected error';
      if (err.status === 401) {
        auth.clear();
        router.navigateByUrl('/login');
      }
      toast.error(msg);
      return throwError(() => err);
    }),
  );
};
