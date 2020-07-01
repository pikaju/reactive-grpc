import * as grpc from "@grpc/grpc-js";
import { handleClientStreamingCall } from "@grpc/grpc-js/build/src/server-call";

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

type ReactiveServer<IService> = {
  [rpc in keyof IService]: IService[rpc] extends grpc.handleUnaryCall<
    infer RequestType,
    infer ResponseType
  >
    ? ReactiveServerUnaryMethod<RequestType, ResponseType>
    : IService[rpc] extends handleClientStreamingCall<
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
};

export function defineService<IServer>(
  serviceInfo: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
  service: ReactiveServer<IServer>
): IServer {
  const server: any = {};
  for (const [key, value] of Object.entries(serviceInfo)) {
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
