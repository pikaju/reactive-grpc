import * as grpc from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import {
  ReactiveNodeClientUnaryMethod,
  ReactiveNodeClientRequestStreamMethod,
  ReactiveNodeClientResponseStreamMethod,
  ReactiveNodeClientBidirectionalStreamMethod,
} from './client_methods';
import { observableFromStream } from '../common/observable_from_stream';
import { mapObservableErrors, toReactiveError } from './error_mappers';
import { Metadata } from './metadata';

/**
 * Mapped type that transforms all gRPC method signatures within the gRPC client
 * into their reactive counterparts.
 */
export type ReactiveNodeClient<ClientType extends grpc.Client> = {
  [rpc in keyof ClientType]: ClientType[rpc] extends (
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>
  ) => grpc.ClientDuplexStream<infer RequestType, infer ResponseType>
    ? ReactiveNodeClientBidirectionalStreamMethod<RequestType, ResponseType>
    : ClientType[rpc] extends (
        request: infer RequestType,
        metadata: grpc.Metadata,
        options: Partial<grpc.CallOptions>
      ) => grpc.ClientReadableStream<infer ResponseType>
    ? ReactiveNodeClientResponseStreamMethod<RequestType, ResponseType>
    : ClientType[rpc] extends (
        metadata: grpc.Metadata,
        options: Partial<grpc.CallOptions>,
        callback: (
          error: grpc.ServiceError | null,
          response: infer ResponseType
        ) => void
      ) => grpc.ClientWritableStream<infer RequestType>
    ? ReactiveNodeClientRequestStreamMethod<RequestType, ResponseType>
    : ClientType[rpc] extends (
        request: infer RequestType,
        metadata: grpc.Metadata,
        options: Partial<grpc.CallOptions>,
        callback: (
          error: grpc.ServiceError | null,
          response: infer ResponseType
        ) => void
      ) => grpc.ClientUnaryCall
    ? ReactiveNodeClientUnaryMethod<RequestType, ResponseType>
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
): ReactiveNodeClientUnaryMethod<RequestType, ResponseType> {
  return (request: RequestType, metadata?: Metadata | grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    const grpcMetadata = metadata instanceof Metadata ? metadata.toGrpcType() : metadata || new grpc.Metadata();

    let call: grpc.ClientUnaryCall;
    const result = new Promise((resolve, reject) => {
      const callback = (error: unknown, response: ResponseType) => error ? reject(toReactiveError(error)) : resolve(response);
      if (options) call = method(request, grpcMetadata, options, callback);
      else call = method(request, grpcMetadata, callback);
    }) as ReturnType<ReactiveNodeClientUnaryMethod<RequestType, ResponseType>>;
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
): ReactiveNodeClientRequestStreamMethod<RequestType, ResponseType> {
  return (request: Observable<RequestType>, metadata?: Metadata | grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    const grpcMetadata = metadata instanceof Metadata ? metadata.toGrpcType() : metadata || new grpc.Metadata();

    let call: grpc.ClientWritableStream<RequestType>;
    const result = new Promise((resolve, reject) => {
      const callback = (error: unknown, response: ResponseType) => error ? reject(toReactiveError(error)) : resolve(response);
      if (options) call = method(grpcMetadata, options, callback);
      else call = method(grpcMetadata, callback);
      request.subscribe(
        (value) => call.write(value),
        (error) => call.destroy(error),
        () => call.end()
      );
    }) as ReturnType<ReactiveNodeClientRequestStreamMethod<RequestType, ResponseType>>;
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
): ReactiveNodeClientResponseStreamMethod<RequestType, ResponseType> {
  return (request: RequestType, metadata?: Metadata | grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    const grpcMetadata = metadata instanceof Metadata ? metadata.toGrpcType() : metadata || new grpc.Metadata();
    const call: grpc.ClientReadableStream<ResponseType> = method(request, grpcMetadata, options);
    const result = mapObservableErrors(observableFromStream(call, true), toReactiveError);
    const injectedResult = result as ReturnType<ReactiveNodeClientResponseStreamMethod<RequestType, ResponseType>>;
    injectedResult.call = call;
    return injectedResult;
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
): ReactiveNodeClientBidirectionalStreamMethod<RequestType, ResponseType> {
  return (request: Observable<RequestType>, metadata?: Metadata | grpc.Metadata, options?: Partial<grpc.CallOptions>) => {
    const grpcMetadata = metadata instanceof Metadata ? metadata.toGrpcType() : metadata || new grpc.Metadata();
    const call: grpc.ClientDuplexStream<RequestType, ResponseType> = method(grpcMetadata, options);
    request.subscribe(
      (value) => call.write(value),
      (error) => call.destroy(error),
      () => call.end()
    );
    const result = mapObservableErrors(observableFromStream(call, true), toReactiveError);
    const injectedResult = result as ReturnType<ReactiveNodeClientBidirectionalStreamMethod<RequestType, ResponseType>>;
    injectedResult.call = call;
    return injectedResult;
  };
}

/**
 * Wraps a non-reactive gRPC client so that all methods can be called reactively.
 * @param serviceDefinition The gRPC service definition which the client implements.
 * @param client The standard non-reactive gRPC client to be wrapped.
 * @returns A reactive client which uses the regular client.
 */
export function reactifyNodeClient<ClientType extends grpc.Client>(
  serviceDefinition: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
  client: ClientType
): ReactiveNodeClient<ClientType> {
  const reactiveClient  = {} as ReactiveNodeClient<ClientType>;
  for (const [key, value] of Object.entries(serviceDefinition)) {
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
  return reactiveClient;
}
