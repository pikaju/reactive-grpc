import * as grpc from '@grpc/grpc-js';
import { Observable } from 'rxjs';

/** Optional return value type of reactive server methods with unary responses. */
export interface ReactiveServerUnaryResponse<ResponseType> {
  value: ResponseType;
  trailer?: grpc.Metadata;
  flags?: number;
}

/** Reactive signature for server methods with unary request and response types. */
export type ReactiveServerUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  call: grpc.ServerUnaryCall<RequestType, ResponseType>
) => Promise<ResponseType | ReactiveServerUnaryResponse<ResponseType>>;

/** Reactive signature for server methods with streaming request and unary response types. */
export type ReactiveServerRequestStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  call: grpc.ServerReadableStream<RequestType, ResponseType>
) => Promise<ResponseType | ReactiveServerUnaryResponse<ResponseType>>;

/** Reactive signature for server methods with unary request and streaming response types. */
export type ReactiveServerResponseStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  call: grpc.ServerWritableStream<RequestType, ResponseType>
) => Observable<ResponseType>;

/** Reactive signature for server methods with streaming request and response types. */
export type ReactiveServerBidirectionalStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  call: grpc.ServerDuplexStream<RequestType, ResponseType>
) => Observable<ResponseType>;

/** Reactive signature for all server methods. */
export type ReactiveServerMethod<RequestType, ResponseType> =
  | ReactiveServerUnaryMethod<RequestType, ResponseType>
  | ReactiveServerRequestStreamMethod<RequestType, ResponseType>
  | ReactiveServerResponseStreamMethod<RequestType, ResponseType>
  | ReactiveServerBidirectionalStreamMethod<RequestType, ResponseType>;
