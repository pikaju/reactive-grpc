import * as grpc from 'grpc-web';
import {
  ReactiveWebClientUnaryMethod,
  ReactiveWebClientResponseStreamMethod,
} from './client_methods';
import { observableFromStream } from '../common/observable_from_stream';
import { mapObservableErrors, toReactiveError } from './error_mappers';
import { Metadata } from './metadata';

// Helper types for ReactiveClient
type Methods<ClassType extends Object> = ClassType & Record<string | number| symbol, (...args: unknown[]) => unknown>;
type ResponseFromStream<T> = T extends grpc.ClientReadableStream<infer G> ? G : never;

/**
 * Mapped type that transforms all gRPC method signatures within the gRPC client
 * into their reactive counterparts.
 */
export type ReactiveWebClient<ClientType extends Object> = {
  [rpc in keyof ClientType]: Parameters<Methods<ClientType>[rpc]> extends [
    infer RequestType,
    grpc.Metadata | undefined,
    (err: grpc.Error, response: infer ResponseType) => void
  ]
    ? ReactiveWebClientUnaryMethod<RequestType, ResponseType>
    : Parameters<Methods<ClientType>[rpc]> extends Partial<[infer RequestType, grpc.Metadata | undefined]>
    ? ReactiveWebClientResponseStreamMethod<RequestType, ResponseFromStream<ReturnType<Methods<ClientType>[rpc]>>>
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
): ReactiveWebClientUnaryMethod<RequestType, ResponseType> {
  return (request: RequestType, metadata?: Metadata | grpc.Metadata) => {
    const grpcMetadata: grpc.Metadata = metadata instanceof Metadata ? metadata.toObject() : metadata ?? {}; 

    let call: grpc.ClientReadableStream<ResponseType>;
    const result = new Promise((resolve, reject) => {
      const callback = (error: unknown, response: ResponseType) => error ? reject(toReactiveError(error)) : resolve(response);
      call = method(request, grpcMetadata, callback);
    }) as ReturnType<ReactiveWebClientUnaryMethod<RequestType, ResponseType>>;
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
): ReactiveWebClientResponseStreamMethod<RequestType, ResponseType> {
  return (request: RequestType, metadata?: Metadata | grpc.Metadata) => {
    const grpcMetadata: grpc.Metadata = metadata instanceof Metadata ? metadata.toObject() : metadata ?? {}; 
    const call: grpc.ClientReadableStream<ResponseType> = method(request, grpcMetadata);
    const result = mapObservableErrors(observableFromStream(call));
    const injectedResult = result as ReturnType<ReactiveWebClientResponseStreamMethod<RequestType, ResponseType>>;
    injectedResult.call = call;
    return injectedResult;
  };
}

/**
 * Wraps a non-reactive gRPC Web client so that all methods can be called reactively.
 * @param serviceDefinition The gRPC service definition which the client implements.
 * @param client The standard non-reactive gRPC client to be wrapped.
 * @returns A reactive client which uses the regular client.
 */
export function reactifyWebClient<ClientType extends Object>(client: ClientType): ReactiveWebClient<ClientType> {
  const reactiveClient = {} as ReactiveWebClient<ClientType>;
  for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(client))) {
    if (key === 'constructor') continue;
    const method = (client as unknown as Record<string, Function>)[key].bind(client);

    // Treat methods with a third callback parameter as unary.
    if (method.length === 3) {
      (reactiveClient as Record<string, Function>)[key] = reactifyUnaryMethod(method);
    } else {
      (reactiveClient as Record<string, Function>)[key] = reactifyResponseStreamMethod(method);
    }
  }
  return reactiveClient;
}
