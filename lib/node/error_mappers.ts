import * as grpc from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcError } from '../common/error'

/**
 * Converts a gRPC error provided by this package to an error type understood by gRPC.
 * @param error The error to be converted.
 */
export function toNonReactiveError(error: unknown): {code: number, message: string} {
  if (error instanceof RpcError) {
    return {
      code: error.code,
      message: error.description,
    };
  }
  return {
    code: RpcError.StatusCode.UNKNOWN,
    message: 'Something went wrong.',
  };
}

export function mapReactiveObservableErrors<T extends Observable<unknown>>(observable: T): T {
  return observable.pipe(catchError((err) => throwError(toNonReactiveError(err)))) as T;
}
