import * as grpc from "grpc";
import { Observable } from "rxjs";
import {
  ReactiveClientUnaryMethod,
  ReactiveClientRequestStreamMethod,
  ReactiveClientResponseStreamMethod,
  ReactiveClientBidirectionalStreamMethod,
} from "./client_methods";
import { observableFromClientStream } from "./observable_from_stream";
import { ReactiveServerRequestStreamMethod } from "./server_methods";

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
): ReactiveClientUnaryMethod<RequestType, ResponseType> {
  return (
    request: RequestType,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ) => {
    let call!: grpc.ClientUnaryCall;
    const result = new Promise((resolve, reject) => {
      const callback = (error: any, response: any) =>
        error ? reject(error) : resolve(response);
      call = method(request, metadata, options, callback);
    }) as ReturnType<ReactiveClientUnaryMethod<RequestType, ResponseType>>;
    result.call = call;
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
  method: any
): ReactiveClientRequestStreamMethod<RequestType, ResponseType> {
  return (
    request: Observable<RequestType>,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ) => {
    let call!: grpc.ClientWritableStream<RequestType>;
    const result = new Promise((resolve, reject) => {
      const callback = (error: any, response: any) =>
        error ? reject(error) : resolve(response);
      call = method(metadata, options, callback);
      request.subscribe(
        (value) => call!.write(value),
        (error) => call!.destroy(error),
        () => call!.end()
      );
    }) as ReturnType<
      ReactiveClientRequestStreamMethod<RequestType, ResponseType>
    >;
    result.call = call;
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
): ReactiveClientResponseStreamMethod<RequestType, ResponseType> {
  return (
    request: RequestType,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ) => {
    let call: grpc.ClientReadableStream<ResponseType> = method(
      request,
      metadata,
      options
    );
    const result = observableFromClientStream(call) as ReturnType<
      ReactiveClientResponseStreamMethod<RequestType, ResponseType>
    >;
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
  method: any
): ReactiveClientBidirectionalStreamMethod<RequestType, ResponseType> {
  return (
    request: Observable<RequestType>,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ) => {
    let call: grpc.ClientDuplexStream<RequestType, ResponseType> = method(
      metadata,
      options
    );
    request.subscribe(
      (value) => call.write(value),
      (error) => call.destroy(error),
      () => call.end()
    );
    const result = observableFromClientStream(call) as ReturnType<
      ReactiveClientBidirectionalStreamMethod<RequestType, ResponseType>
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
export function reactifyClient<ClientType extends grpc.Client>(
  serviceDefinition: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
  client: ClientType
): ReactiveClient<ClientType> {
  const reactiveClient: any = {};
  for (const [key, value] of Object.entries(serviceDefinition)) {
    if (!value.requestStream && !value.responseStream) {
      reactiveClient[key] = reactifyUnaryMethod(
        (client as any)[key].bind(client)
      );
    } else if (value.requestStream && !value.responseStream) {
      reactiveClient[key] = reactifyRequestStreamMethod(
        (client as any)[key].bind(client)
      );
    } else if (!value.requestStream && value.responseStream) {
      reactiveClient[key] = reactifyResponseStreamMethod(
        (client as any)[key].bind(client)
      );
    } else {
      reactiveClient[key] = reactifyBidirectionalStreamMethod(
        (client as any)[key].bind(client)
      );
    }
  }
  return reactiveClient as ReactiveClient<ClientType>;
}
