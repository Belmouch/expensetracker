import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('INTERCEPTOR CALLED');

  // Guard access to localStorage so server-side rendering (Node) won't throw.
  // Use typeof checks to ensure we only read browser globals when available.
  const token = (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined')
    ? window.localStorage.getItem('token')
    : null;

  console.log('TOKEN = ', token);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(req.headers.get('Authorization'));
  }

  return next(req);
};