import * as grpc from "grpc";
import { Observable } from "rxjs";

export type ReactiveUnaryMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  canceled?: boolean,
) => Promise<ResponseType>;

export type ReactiveClientStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  canceled?: boolean,
) => Promise<ResponseType>;

export type ReactiveServerStreamMethod<RequestType, ResponseType> = (
  request: RequestType,
  metadata?: grpc.Metadata,
  canceled?: boolean,
) => Observable<ResponseType>;

export type ReactiveBidirectionalStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>,
  metadata?: grpc.Metadata,
  canceled?: boolean,
) => Observable<ResponseType>;

export type ReactiveMethod<RequestType, ResponseType> =
  | ReactiveUnaryMethod<RequestType, ResponseType>
  | ReactiveClientStreamMethod<RequestType, ResponseType>
  | ReactiveServerStreamMethod<RequestType, ResponseType>
  | ReactiveBidirectionalStreamMethod<RequestType, ResponseType>;

type DereactifyMethod<
  ReactiveMethodType extends ReactiveMethod<any, any>
> = ReactiveMethodType extends ReactiveBidirectionalStreamMethod<
  infer RequestType,
  infer ResponseType
>
  ? grpc.handleBidiStreamingCall<RequestType, ResponseType>
  : ReactiveMethodType extends ReactiveServerStreamMethod<
      infer RequestType,
      infer ResponseType
    >
  ? grpc.handleServerStreamingCall<RequestType, ResponseType>
  : ReactiveMethodType extends ReactiveClientStreamMethod<
      infer RequestType,
      infer ResponseType
    >
  ? grpc.handleClientStreamingCall<RequestType, ResponseType>
  : ReactiveMethodType extends ReactiveUnaryMethod<
      infer RequestType,
      infer ResponseType
    >
  ? grpc.handleUnaryCall<RequestType, ResponseType>
  : never;

export function defineMethod<
  ReactiveMethodType extends ReactiveMethod<any, any>
>(method: ReactiveMethodType): DereactifyMethod<ReactiveMethodType> {
  return (null as unknown) as DereactifyMethod<ReactiveMethodType>;
}
