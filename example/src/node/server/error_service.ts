import { Observable, throwError } from 'rxjs';

import { defineService, RpcError } from 'reactive-grpc/node';

import { OneNumber, TwoNumbers, Empty } from '../generated/service_pb';
import { ExampleService, IExampleServer } from '../generated/service_grpc_pb';

/** Reactive server that throws errors on every request. */
export default defineService<IExampleServer>(ExampleService, {
  async addTwoNumbers(request: TwoNumbers): Promise<OneNumber> {
    throw new RpcError(RpcError.StatusCode.FAILED_PRECONDITION, 'The precondition failed.');
  },
  addStreamOfNumbers(request: Observable<OneNumber>): Promise<OneNumber> {
    throw new RpcError(RpcError.StatusCode.OUT_OF_RANGE, 'Out of range!');
  },
  getFibonacciSequence(request: Empty): Observable<OneNumber> {
    return throwError(new RpcError(RpcError.StatusCode.UNAUTHENTICATED, 'Client is not authenticated.'));
  },
  runningAverage(request: Observable<OneNumber>): Observable<OneNumber> {
    return throwError(new RpcError(RpcError.StatusCode.NOT_FOUND, 'Resource not found.'));
  },
});
