import * as grpc from "grpc";
import { Observable } from "rxjs";

type KackMethod<Request, Response> = (
  call: Request,
  callback: Response
) => void;

type GeileMethod<Request, Response> = (
  request: Observable<Request>
) => Observable<Response>;

export type ReactifyService<IService> = {
  [rpc in keyof IService]: IService[rpc] extends KackMethod<
    grpc.ServerUnaryCall<any>,
    any
  >
    ? GeileMethod<Parameters<IService[rpc]>[0], ReturnType<IService[rpc]>>
    : never;
};
