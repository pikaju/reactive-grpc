import * as grpc from '@grpc/grpc-js';
import { Observable, } from 'rxjs';
import {
  ReactiveClientUnaryMethod,
  ReactiveClientRequestStreamMethod,
  ReactiveClientResponseStreamMethod,
  ReactiveClientBidirectionalStreamMethod,
} from './client_methods';
import { observableFromStream, } from '../observable_from_stream';

/**
 * Mapped type that transforms all gRPC method signatures within the gRPC client
 * into their reactive counterparts.
 */
type ReactiveClient<ClientType extends grpc.Client> = {
  [rpc in keyof ClientType]: ClientType[rpc] extends (
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>
  ) => grpc.ClientDuplexStream<infer RequestType, infer ResponseType>
    ? ReactiveClientBidirectionalStreamMethod<RequestType, ResponseType>
    : ClientType[rpc] extends (
        request: infer RequestType,
        metadata: grpc.Metadata,
        options: Partial<grpc.CallOptions>
      ) => grpc.ClientReadableStream<infer ResponseType>
    ? ReactiveClientResponseStreamMethod<RequestType, ResponseType>
    : ClientType[rpc] extends (
        metadata: grpc.Metadata,
        options: Partial<grpc.CallOptions>,
        callback: (
          error: grpc.ServiceError | null,
          response: infer ResponseType
        ) => void
      ) => grpc.ClientWritableStream<infer RequestType>
    ? ReactiveClientRequestStreamMethod<RequestType, ResponseType>
    : ClientType[rpc] extends (
        request: infer RequestType,
        metadata: grpc.Metadata,
        options: Partial<grpc.CallOptions>,
        callback: (
          error: grpc.ServiceError | null,
          response: infer ResponseType
        ) => void
      ) => grpc.ClientUnaryCall
    ? ReactiveClientUnaryMethod<RequestType, ResponseType>
    : unknown;
};

/**
 * Wraps a single gRPC client method with unary request and response types
 * with its reactive counterpart.
 * @param method The gRPC client method to be wrapped.
 * @returns A reactive version of the standard method.
 */
function reactifyUnaryMethod<RequestType, ResponseType>(
  method: Function
): ReactiveClientUnaryMethod<RequestType, ResponseType> {
  return (request: RequestType, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    let call: grpc.ClientUnaryCall;
    const result = new Promise((resolve, reject) => {
      const callback = (error: unknown, response: ResponseType) => error ? reject(error) : resolve(response);
      metadata = metadata || new grpc.Metadata();
      if (options) call = method(request, metadata, options, callback);
      else call = method(request, metadata, callback);
    }) as ReturnType<ReactiveClientUnaryMethod<RequestType, ResponseType>>;
    // Promise executor is executed immediately.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result.call = call!;
    return result;
  };
}

/**
 * Wraps a single gRPC client method with streaming request and unary response types
 * with its reactive counterpart.
 * @param method The gRPC client method to be wrapped.
 * @returns A reactive version of the standard method.
 */
function reactifyRequestStreamMethod<RequestType, ResponseType>(
  method: Function
): ReactiveClientRequestStreamMethod<RequestType, ResponseType> {
  return (request: Observable<RequestType>, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    let call: grpc.ClientWritableStream<RequestType>;
    const result = new Promise((resolve, reject) => {
      const callback = (error: unknown, response: ResponseType) => error ? reject(error) : resolve(response);
      metadata = metadata || new grpc.Metadata();
      if (options) call = method(metadata, options, callback);
      else call = method(metadata, callback);
      request.subscribe(
        (value) => call.write(value),
        (error) => call.destroy(error),
        () => call.end()
      );
    }) as ReturnType<ReactiveClientRequestStreamMethod<RequestType, ResponseType>>;
    // Promise executor is executed immediately.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result.call = call!;
    return result;
  };
}

/**
 * Wraps a single gRPC client method with unary request and streaming response types
 * with its reactive counterpart.
 * @param method The gRPC client method to be wrapped.
 * @returns A reactive version of the standard method.
 */
function reactifyResponseStreamMethod<RequestType, ResponseType>(
  method: Function
): ReactiveClientResponseStreamMethod<RequestType, ResponseType> {
  return (request: RequestType, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    const call: grpc.ClientReadableStream<ResponseType> = method(request, metadata, options);
    const result = observableFromStream(call, true) as ReturnType<ReactiveClientResponseStreamMethod<RequestType, ResponseType>>;
    result.call = call;
    return result;
  };
}

/**
 * Wraps a single gRPC client method with streaming request and response types
 * with its reactive counterpart.
 * @param method The gRPC client method to be wrapped.
 * @returns A reactive version of the standard method.
 */
function reactifyBidirectionalStreamMethod<RequestType, ResponseType>(
  method: Function
): ReactiveClientBidirectionalStreamMethod<RequestType, ResponseType> {
  return (request: Observable<RequestType>, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    const call: grpc.ClientDuplexStream<RequestType, ResponseType> = method(metadata, options);
    request.subscribe(
      (value) => call.write(value),
      (error) => call.destroy(error),
      () => call.end()
    );
    const result = observableFromStream(call, true) as ReturnType<ReactiveClientBidirectionalStreamMethod<RequestType, ResponseType>>;
    result.call = call;
    return result;
  };
}

/**
 * Wraps a non-reactive gRPC client so that all methods can be called reactively.
 * @param serviceDefinition The gRPC service definition which the client implements.
 * @param client The standard non-reactive gRPC client to be wrapped.
 * @returns A reactive client which uses the regular client.
 */
export function reactifyClient<ClientType extends grpc.Client>(
  serviceDefinition: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
  client: ClientType
): ReactiveClient<ClientType> {
  const reactiveClient  = {} as ReactiveClient<ClientType>;
  for (const [key, value,] of Object.entries(serviceDefinition)) {
    const method = (client as unknown as Record<string, Function>)[key].bind(client);
    if (!value.requestStream && !value.responseStream) {
      (reactiveClient as Record<string, Function>)[key] = reactifyUnaryMethod(method);
    } else if (value.requestStream && !value.responseStream) {
      (reactiveClient as Record<string, Function>)[key] = reactifyRequestStreamMethod(method);
    } else if (!value.requestStream && value.responseStream) {
      (reactiveClient as Record<string, Function>)[key] = reactifyResponseStreamMethod(method);
    } else {
      (reactiveClient as Record<string, Function>)[key] = reactifyBidirectionalStreamMethod(method);
    }
  }
  return reactiveClient as ReactiveClient<ClientType>;
}
