import * as grpc from '@grpc/grpc-js';
import { handleClientStreamingCall } from '@grpc/grpc-js/build/src/server-call';

import {
  ReactiveServerUnaryResponse,
  ReactiveServerUnaryMethod,
  ReactiveServerRequestStreamMethod,
  ReactiveServerResponseStreamMethod,
  ReactiveServerBidirectionalStreamMethod,
} from './server_methods';
import { observableFromStream } from '../common/observable_from_stream';
import { toNonReactiveError } from './error_mappers';
import { throwError } from 'rxjs';

/**
 * Calls the specified callback after the promise has finished based on the
 * the value or error the promise completed with.
 * @param callback gRPC callback for server implementations.
 * @param result Return value of a reactive server method.
 */
function handleUnaryResult<ResponseType>(
  callback: grpc.sendUnaryData<ResponseType>,
  result: Promise<ResponseType | ReactiveServerUnaryResponse<ResponseType>>
): void {
  result.then(
    (response) => {
      const unaryResponse = response as ReactiveServerUnaryResponse<ResponseType>;
      if (unaryResponse.value)
        callback(
          null,
          unaryResponse.value,
          unaryResponse.trailer,
          unaryResponse.flags
        );
      else callback(null, response as ResponseType);
    },
    (error) => callback(toNonReactiveError(error), null)
  );
}

/**
 * Wraps a single reactive unary method with its non-reactive counterpart.
 * @param method The reactive method to be wrapped.
 * @returns A standard gRPC method.
 */
export function defineUnaryMethod<RequestType, ResponseType>(
  method: ReactiveServerUnaryMethod<RequestType, ResponseType>
): grpc.handleUnaryCall<RequestType, ResponseType> {
  return (
    call: grpc.ServerUnaryCall<RequestType, ResponseType>,
    callback: grpc.sendUnaryData<ResponseType>
  ): void => {
    handleUnaryResult(callback, method(call.request, call));
  };
}

/**
 * Wraps a single reactive method with a stream request and unary response
 * with its non-reactive counterpart.
 * @param method The reactive method to be wrapped.
 * @returns A standard gRPC method.
 */
export function defineRequestStreamMethod<RequestType, ResponseType>(
  method: ReactiveServerRequestStreamMethod<RequestType, ResponseType>
): handleClientStreamingCall<RequestType, ResponseType> {
  return (
    call: grpc.ServerReadableStream<RequestType, ResponseType>,
    callback: grpc.sendUnaryData<ResponseType>
  ): void => {
    const observable = observableFromStream<RequestType>(call);
    handleUnaryResult(callback, method(observable, call));
  };
}

/**
 * Wraps a single reactive method with a unary request and stream response
 * with its non-reactive counterpart.
 * @param method The reactive method to be wrapped.
 * @returns A standard gRPC method.
 */
export function defineResponseStreamMethod<RequestType, ResponseType>(
  method: ReactiveServerResponseStreamMethod<RequestType, ResponseType>
): grpc.handleServerStreamingCall<RequestType, ResponseType> {
  return (call: grpc.ServerWritableStream<RequestType, ResponseType>): void => {
    const result = method(call.request, call);
    const subscription = result.subscribe(
      (value) => call.write(value),
      (error) => call.destroy(error),
      () => call.end()
    );
    call.on('cancelled', () => subscription.unsubscribe());
  };
}

/**
 * Wraps a single reactive method with a stream request and response
 * with its non-reactive counterpart.
 * @param method The reactive method to be wrapped.
 * @returns A standard gRPC method.
 */
export function defineBidirectionalStreamMethod<RequestType, ResponseType>(
  method: ReactiveServerBidirectionalStreamMethod<RequestType, ResponseType>
): grpc.handleBidiStreamingCall<RequestType, ResponseType> {
  return (call: grpc.ServerDuplexStream<RequestType, ResponseType>): void => {
    const observable = observableFromStream<RequestType>(call);
    const result = method(observable, call);
    const subscription = result.subscribe(
      (value) => call.write(value),
      (error) => call.destroy(error),
      () => call.end()
    );
    call.on('cancelled', () => subscription.unsubscribe());
  };
}
