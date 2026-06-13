import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { MetricsController } from '../../modules/metrics/metrics.controller';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsController) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    this.metrics.incrementRequests();
    return next.handle().pipe(
      tap(() => {}),
      catchError((err) => {
        this.metrics.incrementErrors();
        return throwError(() => err);
      }),
    );
  }
}
