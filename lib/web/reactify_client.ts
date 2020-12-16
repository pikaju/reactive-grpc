import * as grpc from "grpc-web";
import {
  ReactiveWebClientUnaryMethod,
  ReactiveWebClientResponseStreamMethod,
} from "./client_methods";
import { observableFromStream } from "../observable_from_stream";

type Methods<ClassType extends Object> = ClassType & Record<string | number| symbol, (...args: any) => any>;
type ResponseFromStream<T> = T extends grpc.ClientReadableStream<infer G> ? G : never;

/**
 * Mapped type that transforms all gRPC method signatures within the gRPC client
 * into their reactive counterparts.
 */
type ReactiveClient<ClientType extends Object> = {
  [rpc in keyof ClientType]: Parameters<Methods<ClientType>[rpc]> extends [
    infer RequestType,
    grpc.Metadata | undefined,
    (err: grpc.Error, response: infer ResponseType) => void
  ]
    ? ReactiveWebClientUnaryMethod<RequestType, ResponseType>
    : Parameters<Methods<ClientType>[rpc]> extends Partial<[
        infer RequestType,
        grpc.Metadata | undefined,
      ]>
    ? ReactiveWebClientResponseStreamMethod<RequestType, ResponseFromStream<ReturnType<Methods<ClientType>[rpc]>>>
    : never;
};

/**
 * Wraps a single gRPC client method with unary request and response types
 * with its reactive counterpart.
 * @param method The gRPC client method to be wrapped.
 * @returns A reactive version of the standard method.
 */
function reactifyUnaryMethod<RequestType, ResponseType>(
  method: any
): ReactiveWebClientUnaryMethod<RequestType, ResponseType> {
  return (
    request: RequestType,
    metadata?: grpc.Metadata,
  ) => {
    let call: grpc.ClientReadableStream<ResponseType>;
    const result = new Promise((resolve, reject) => {
      const callback = (error: any, response: any) =>
        error ? reject(error) : resolve(response);
      metadata = metadata || {};
      call = method(request, metadata, callback);
    }) as ReturnType<ReactiveWebClientUnaryMethod<RequestType, ResponseType>>;
    result.call = call!; // Promise executor is executed immediately.
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
  method: any
): ReactiveWebClientResponseStreamMethod<RequestType, ResponseType> {
  return (
    request: RequestType,
    metadata?: grpc.Metadata,
  ) => {
    let call: grpc.ClientReadableStream<ResponseType> = method(
      request,
      metadata,
    );
    const result = observableFromStream(call) as ReturnType<
      ReactiveWebClientResponseStreamMethod<RequestType, ResponseType>
    >;
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
export function reactifyWebClient<ClientType extends Object>(client: ClientType): ReactiveClient<ClientType> {
  const reactiveClient: any = {};
  for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(client))) {
    if (key === 'constructor') continue;
    const method = ((client as any)[key] as Function).bind(client);

    // Treat methods with a third callback parameter as unary.
    if (method.length === 3) {
      reactiveClient[key] = reactifyUnaryMethod(method);
    } else {
      reactiveClient[key] = reactifyResponseStreamMethod(method);
    }
  }
  return reactiveClient as ReactiveClient<ClientType>;
}
