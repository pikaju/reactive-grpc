import * as grpc from "grpc";
import { Observable } from "rxjs";
import {
  ReactiveClientUnaryMethod,
  ReactiveClientRequestStreamMethod,
  ReactiveClientResponseStreamMethod,
  ReactiveClientBidirectionalStreamMethod,
} from "./client_methods";
import { observableFromClientStream } from "./observable_from_stream";

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

function reactifyUnaryMethod<RequestType, ResponseType>(
  method: any
): ReactiveClientUnaryMethod<RequestType, ResponseType> {
  return (
    request: RequestType,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ) => {
    return new Promise((resolve, reject) => {
      const callback = (error: any, response: any) =>
        error ? reject(error) : resolve(response);
      let call: grpc.ClientUnaryCall = method(
        request,
        metadata,
        options,
        callback
      );
    });
  };
}

function reactifyRequestStreamMethod<RequestType, ResponseType>(
  method: any
): ReactiveClientRequestStreamMethod<RequestType, ResponseType> {
  return (
    request: Observable<RequestType>,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ) => {
    return new Promise((resolve, reject) => {
      const callback = (error: any, response: any) =>
        error ? reject(error) : resolve(response);
      const call: grpc.ClientWritableStream<RequestType> = method(
        metadata,
        options,
        callback
      );
      request.subscribe(
        (value) => call.write(value),
        (error) => call.destroy(error),
        () => call.end()
      );
    });
  };
}

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
    return observableFromClientStream(call);
  };
}

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
    return observableFromClientStream(call);
  };
}

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
