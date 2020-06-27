import * as grpc from "grpc";
import { Observable } from "rxjs";
import {
  ReactiveServerUnaryMethod,
  ReactiveServerRequestStreamMethod,
  ReactiveServerResponseStreamMethod,
  ReactiveServerBidirectionalStreamMethod,
} from "./server_methods";

function observableFromStream<T>(stream: NodeJS.ReadableStream) {
  return new Observable<T>((observable) => {
    function errorHandler(error: any) {
      observable.error(error);
      observable.complete();
    }
    stream.on("data", observable.next);
    stream.on("error", errorHandler);
    stream.on("end", observable.complete);
    return () => {
      stream.removeListener("data", observable.next);
      stream.removeListener("error", errorHandler);
      stream.removeListener("end", observable.complete);
    };
  });
}

export function defineUnaryMethod<RequestType, ResponseType>(
  method: ReactiveServerUnaryMethod<RequestType, ResponseType>
): grpc.handleUnaryCall<RequestType, ResponseType> {
  return (
    call: grpc.ServerUnaryCall<RequestType>,
    callback: grpc.sendUnaryData<ResponseType>
  ): void => {
    const result = method(call.request, call.metadata, call.cancelled);
    result.then(
      (value) => callback(null, value),
      (reason) => callback(reason, null)
    );
  };
}

export function defineRequestStreamMethod<RequestType, ResponseType>(
  method: ReactiveServerRequestStreamMethod<RequestType, ResponseType>
): grpc.handleClientStreamingCall<RequestType, ResponseType> {
  return (
    call: grpc.ServerReadableStream<RequestType>,
    callback: grpc.sendUnaryData<ResponseType>
  ): void => {
    const observable = observableFromStream<RequestType>(call);
    const result = method(observable, call.metadata, call.cancelled);
    result.then(
      (value) => callback(null, value),
      (reason) => callback(reason, null)
    );
  };
}

export function defineResponseStreamMethod<RequestType, ResponseType>(
  method: ReactiveServerResponseStreamMethod<RequestType, ResponseType>
): grpc.handleServerStreamingCall<RequestType, ResponseType> {
  return (call: grpc.ServerWritableStream<RequestType>): void => {
    const result = method(call.request, call.metadata, call.cancelled);
    result.subscribe(
      (value) => call.write(value),
      (error) => call.destroy(error),
      () => call.end()
    );
  };
}

export function defineBidirectionalStreamMethod<RequestType, ResponseType>(
  method: ReactiveServerBidirectionalStreamMethod<RequestType, ResponseType>
): grpc.handleBidiStreamingCall<RequestType, ResponseType> {
  return (call: grpc.ServerDuplexStream<RequestType, ResponseType>): void => {
    const observable = observableFromStream<RequestType>(call);
    const result = method(observable, call.metadata, call.cancelled);
    result.subscribe(
      (value) => call.write(value),
      (error) => call.destroy(error),
      () => call.end()
    );
  };
}
