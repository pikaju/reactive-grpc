import * as grpc from "grpc";
import { Observable } from "rxjs";

export interface ReactiveServerUnaryResponse<ResponseType> {
  value: ResponseType;
  trailer?: grpc.Metadata;
  flags?: number;
}

export type ReactiveServerUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  call?: grpc.ServerUnaryCall<RequestType>
) => Promise<ResponseType | ReactiveServerUnaryResponse<ResponseType>>;

export type ReactiveServerRequestStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  call?: grpc.ServerReadableStream<RequestType>
) => Promise<ResponseType | ReactiveServerUnaryResponse<ResponseType>>;

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
