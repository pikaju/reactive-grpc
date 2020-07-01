import * as grpc from "grpc";
import { Observable } from "rxjs";

export type ReactiveServerUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  call?: grpc.ServerUnaryCall<RequestType>
) => Promise<ResponseType>;

export type ReactiveServerRequestStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  call?: grpc.ServerReadableStream<RequestType>
) => Promise<ResponseType>;

export type ReactiveServerResponseStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  call?: grpc.ServerWritableStream<RequestType>
) => Observable<ResponseType>;

export type ReactiveServerBidirectionalStreamMethod<
  RequestType,
  ResponseType
> = (
  request: Observable<RequestType>,
  call?: grpc.ServerDuplexStream<RequestType, ResponseType>
) => Observable<ResponseType>;

export type ReactiveServerMethod<RequestType, ResponseType> =
  | ReactiveServerUnaryMethod<RequestType, ResponseType>
  | ReactiveServerRequestStreamMethod<RequestType, ResponseType>
  | ReactiveServerResponseStreamMethod<RequestType, ResponseType>
  | ReactiveServerBidirectionalStreamMethod<RequestType, ResponseType>;
