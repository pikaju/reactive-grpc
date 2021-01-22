import * as grpc from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcError } from '../common/error'

/**
 * Converts a non-reactive gRPC error to an error type provided by this package.
 * @param error The error to be converted.
 */
export function toReactiveError(error: unknown): RpcError {
  let code = RpcError.StatusCode.UNKNOWN;
  let details = 'Something went wrong.';
  if (typeof error === 'object' && error != null) {
    const grpcError = error as grpc.ServiceError;
    if (typeof grpcError.code === 'number') code = grpcError.code as number;
    if (typeof grpcError.details === 'string') details = grpcError.details;
  }
  return new RpcError(code, details);
}

/**
 * Converts a gRPC error provided by this package, or a generic non-gRPC error, to an error type understood by gRPC.
 * A non-gRPC error is treated as "unknown" and details are discarded due to security concerns.
 * @param error The error to be converted.
 */
export function toNonReactiveError(error: unknown): {code: number, message: string} {
  if (error instanceof RpcError) {
    return {
      code: error.code,
      message: error.details,
    };
  }
  return {
    code: RpcError.StatusCode.UNKNOWN,
    message: 'Something went wrong.',
  };
}

/**
 * Maps an observable to a new observable whose errors are converted with the help of a mapping function.
 * @param observable Observable to be mapped.
 * @param mappingFunction Error type mapping function.
 */
export function mapObservableErrors<T>(observable: Observable<T>, mappingFunction: (err: unknown) => unknown): Observable<T> {
  return observable.pipe(catchError((err) => throwError(mappingFunction(err))));
}
