import * as grpc from 'grpc-web';
import { Observable } from 'rxjs';

import { Metadata } from './metadata';

/** Reactive signature for web client methods with unary request and response types. */
export type ReactiveWebClientUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: Metadata | grpc.Metadata,
) => Promise<ResponseType> & { call: grpc.ClientReadableStream<ResponseType> };

/** Reactive signature for web client methods with unary request and streaming response types. */
export type ReactiveWebClientResponseStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: Metadata | grpc.Metadata,
) => Observable<ResponseType> & { call: grpc.ClientReadableStream<ResponseType> };
