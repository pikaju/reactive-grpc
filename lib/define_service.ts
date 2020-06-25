import * as grpc from "grpc";
import {
  ReactiveUnaryMethod,
  ReactiveClientStreamMethod,
  ReactiveServerStreamMethod,
  ReactiveBidirectionalStreamMethod,
  defineMethod,
} from "./define_method";

type ReactifyService<IService> = {
  [rpc in keyof IService]: IService[rpc] extends grpc.handleUnaryCall<
    infer RequestType,
    infer ResponseType
  >
    ? ReactiveUnaryMethod<RequestType, ResponseType>
    : IService[rpc] extends grpc.handleClientStreamingCall<
        infer RequestType,
        infer ResponseType
      >
    ? ReactiveClientStreamMethod<RequestType, ResponseType>
    : IService[rpc] extends grpc.handleServerStreamingCall<
        infer RequestType,
        infer ResponseType
      >
    ? ReactiveServerStreamMethod<RequestType, ResponseType>
    : IService[rpc] extends grpc.handleBidiStreamingCall<
        infer RequestType,
        infer ResponseType
      >
    ? ReactiveBidirectionalStreamMethod<RequestType, ResponseType>
    : never;
};

export function defineService<IServer>(
  serviceInfo: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
  service: ReactifyService<IServer>
): IServer {
  type Placeholder = number;
  const server: any = {};
  for (const [key, value] of Object.entries(serviceInfo)) {
    if (!value.requestStream && !value.responseStream) {
      server[key] = defineMethod((service as any)[key] as ReactiveUnaryMethod<Placeholder, Placeholder>);
    } else if (value.requestStream && !value.responseStream) {
      server[key] = defineMethod((service as any)[key] as ReactiveClientStreamMethod<Placeholder, Placeholder>);
    } else if (!value.requestStream && value.responseStream) {
      server[key] = defineMethod((service as any)[key] as ReactiveServerStreamMethod<Placeholder, Placeholder>);
    } else {
      server[key] = defineMethod((service as any)[key] as ReactiveBidirectionalStreamMethod<Placeholder, Placeholder>);
    }
  }
  return server as IServer;
}
