import * as grpc from "grpc";
import { Observable } from "rxjs";

export type ReactiveClientUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Promise<ResponseType>;

export type ReactiveClientClientStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Promise<ResponseType>;

export type ReactiveClientServerStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Observable<ResponseType>;

export type ReactiveClientBidirectionalStreamMethod<
  RequestType,
  ResponseType
> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Observable<ResponseType>;

export type ReactiveClientMethod<RequestType, ResponseType> =
  | ReactiveClientUnaryMethod<RequestType, ResponseType>
  | ReactiveClientClientStreamMethod<RequestType, ResponseType>
  | ReactiveClientServerStreamMethod<RequestType, ResponseType>
  | ReactiveClientBidirectionalStreamMethod<RequestType, ResponseType>;
