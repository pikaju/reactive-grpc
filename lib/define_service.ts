import * as grpc from "grpc";

type ReactifyService<IService> = {
  [rpc in keyof IService]: IService[rpc] extends grpc.handleUnaryCall<any, any>
    ? ()
    : never;
};

export function reactifyService<IServer>(serviceInfo: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>, service: ReactifyService<IServer>): IServer {
  return {} as IServer;
}