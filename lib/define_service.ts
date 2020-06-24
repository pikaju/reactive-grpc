import * as grpc from "grpc";
import {
  ReactiveUnaryMethod,
  ReactiveClientStreamMethod,
  ReactiveServerStreamMethod,
  ReactiveBidirectionalStreamMethod,
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
  return {} as IServer;
}
