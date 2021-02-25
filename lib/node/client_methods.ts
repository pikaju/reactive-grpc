import * as grpc from '@grpc/grpc-js';
import { Observable } from 'rxjs';

/** Reactive signature for client methods with unary request and response types. */
export type ReactiveNodeClientUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Promise<ResponseType> & { call: grpc.ClientUnaryCall };

/** Reactive signature for client methods with streaming request and unary response types. */
export type ReactiveNodeClientRequestStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Promise<ResponseType> & { call: grpc.ClientWritableStream<RequestType> };

/** Reactive signature for client methods with unary request and streaming response types. */
export type ReactiveNodeClientResponseStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Observable<ResponseType> & { call: grpc.ClientReadableStream<ResponseType> };

/** Reactive signature for client methods with streaming request and response types. */
export type ReactiveNodeClientBidirectionalStreamMethod<
  RequestType,
  ResponseType
> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  options?: Partial<grpc.CallOptions>
) => Observable<ResponseType> & { call: grpc.ClientDuplexStream<RequestType, ResponseType> };

/** Reactive signature for all client methods. */
export type ReactiveNodeClientMethod<RequestType, ResponseType> =
  | ReactiveNodeClientUnaryMethod<RequestType, ResponseType>
  | ReactiveNodeClientRequestStreamMethod<RequestType, ResponseType>
  | ReactiveNodeClientResponseStreamMethod<RequestType, ResponseType>
  | ReactiveNodeClientBidirectionalStreamMethod<RequestType, ResponseType>;
