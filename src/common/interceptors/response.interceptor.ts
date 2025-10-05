// src/common/interceptors/network-response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_RESPONSE_INTERCEPTOR } from '../constants';

@Injectable()
export class NetworkResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<{ message: string; status: number; data?: any }> {
    const skip =
      this.reflector.get<boolean>(
        SKIP_RESPONSE_INTERCEPTOR,
        context.getHandler(),
      ) ||
      this.reflector.get<boolean>(
        SKIP_RESPONSE_INTERCEPTOR,
        context.getClass(),
      );

    if (skip) return next.handle();
    // Get the response object to retrieve the status code
    const res = context.switchToHttp().getResponse();
    const statusCode = res.statusCode;
    return next.handle().pipe(
      map((data) => ({
        message: 'OK',
        status: statusCode,
        data: data,
      })),
    );
  }
}
