import * as grpc from "grpc";
import {
  ReactiveUnaryMethod,
  ReactiveClientStreamMethod,
  ReactiveServerStreamMethod,
  ReactiveBidirectionalStreamMethod,
  defineUnaryMethod,
  defineClientStreamMethod,
  defineServerStreamMethod,
  defineBidirectionalStreamMethod,
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
      server[key] = defineUnaryMethod((service as any)[key]);
    } else if (value.requestStream && !value.responseStream) {
      server[key] = defineClientStreamMethod((service as any)[key]);
    } else if (!value.requestStream && value.responseStream) {
      server[key] = defineServerStreamMethod((service as any)[key]);
    } else {
      server[key] = defineBidirectionalStreamMethod((service as any)[key]);
    }
  }
  return server as IServer;
}
