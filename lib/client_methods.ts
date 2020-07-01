import * as grpc from "grpc";
import { Observable } from "rxjs";

export type ReactiveClientUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Promise<ResponseType>;

export type ReactiveClientRequestStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Promise<ResponseType>;

export type ReactiveClientResponseStreamMethod<RequestType, ResponseType> = (
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
  | ReactiveClientRequestStreamMethod<RequestType, ResponseType>
  | ReactiveClientResponseStreamMethod<RequestType, ResponseType>
  | ReactiveClientBidirectionalStreamMethod<RequestType, ResponseType>;
