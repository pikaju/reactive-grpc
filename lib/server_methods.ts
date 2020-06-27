import * as grpc from "grpc";
import { Observable } from "rxjs";

export type ReactiveServerUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Promise<ResponseType>;

export type ReactiveServerRequestStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Promise<ResponseType>;

export type ReactiveServerResponseStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Observable<ResponseType>;

export type ReactiveServerBidirectionalStreamMethod<
  RequestType,
  ResponseType
> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  canceled?: boolean
) => Observable<ResponseType>;

export type ReactiveServerMethod<RequestType, ResponseType> =
  | ReactiveServerUnaryMethod<RequestType, ResponseType>
  | ReactiveServerRequestStreamMethod<RequestType, ResponseType>
  | ReactiveServerResponseStreamMethod<RequestType, ResponseType>
  | ReactiveServerBidirectionalStreamMethod<RequestType, ResponseType>;
