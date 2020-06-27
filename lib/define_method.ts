import * as grpc from "grpc";
import { Observable, observable } from "rxjs";

export type ReactiveUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Promise<ResponseType>;

export type ReactiveClientStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Promise<ResponseType>;

export type ReactiveServerStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Observable<ResponseType>;

export type ReactiveBidirectionalStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Observable<ResponseType>;

export type ReactiveMethod<RequestType, ResponseType> =
  | ReactiveUnaryMethod<RequestType, ResponseType>
  | ReactiveClientStreamMethod<RequestType, ResponseType>
  | ReactiveServerStreamMethod<RequestType, ResponseType>
  | ReactiveBidirectionalStreamMethod<RequestType, ResponseType>;

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
  method: ReactiveUnaryMethod<RequestType, ResponseType>
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

export function defineClientStreamMethod<RequestType, ResponseType>(
  method: ReactiveClientStreamMethod<RequestType, ResponseType>
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

export function defineServerStreamMethod<RequestType, ResponseType>(
  method: ReactiveServerStreamMethod<RequestType, ResponseType>
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
  method: ReactiveBidirectionalStreamMethod<RequestType, ResponseType>
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
