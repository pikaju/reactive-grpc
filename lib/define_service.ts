import * as grpc from "grpc";
import {
  ReactiveServerUnaryMethod,
  ReactiveServerRequestStreamMethod,
  ReactiveServerResponseStreamMethod,
  ReactiveServerBidirectionalStreamMethod,
} from "./server_methods";
import {
  defineUnaryMethod,
  defineRequestStreamMethod,
  defineResponseStreamMethod,
  defineBidirectionalStreamMethod,
} from "./define_method";

/**
 * Mapped type that transforms all gRPC method signatures within the `IService` template type
 * into their reactive counterparts so as to allow for type checking and inference.
 */
type ReactiveServer<IService> = {
  [rpc in keyof IService]: IService[rpc] extends grpc.handleUnaryCall<
    infer RequestType,
    infer ResponseType
  >
    ? ReactiveServerUnaryMethod<RequestType, ResponseType>
    : IService[rpc] extends grpc.handleClientStreamingCall<
        infer RequestType,
        infer ResponseType
      >
    ? ReactiveServerRequestStreamMethod<RequestType, ResponseType>
    : IService[rpc] extends grpc.handleServerStreamingCall<
        infer RequestType,
        infer ResponseType
      >
    ? ReactiveServerResponseStreamMethod<RequestType, ResponseType>
    : IService[rpc] extends grpc.handleBidiStreamingCall<
        infer RequestType,
        infer ResponseType
      >
    ? ReactiveServerBidirectionalStreamMethod<RequestType, ResponseType>
    : never;
} & {
  [propName: string]: any
};

/**
 * Wraps a reactive server instance so that it becomes a standard,
 * non-reactive server which can subsequently be used as a regular gRPC service.
 * Calling a method on the wrapping service will call the associated reactive method.
 * @param serviceDefinition The gRPC service definition. Usually generated from protocol buffer files.
 * @param service The reactive service that is to be dereactified.
 * @returns An object containing standard gRPC methods.
 */
export function defineService<IServer>(
  serviceDefinition: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
  service: ReactiveServer<IServer>,
): IServer {
  const server: any = {};
  for (const [key, value] of Object.entries(serviceDefinition)) {
    if (!value.requestStream && !value.responseStream) {
      server[key] = defineUnaryMethod((service as any)[key]);
    } else if (value.requestStream && !value.responseStream) {
      server[key] = defineRequestStreamMethod((service as any)[key]);
    } else if (!value.requestStream && value.responseStream) {
      server[key] = defineResponseStreamMethod((service as any)[key]);
    } else {
      server[key] = defineBidirectionalStreamMethod((service as any)[key]);
    }
  }
  return server as IServer;
}
