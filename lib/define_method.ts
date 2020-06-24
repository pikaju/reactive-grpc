import * as grpc from "grpc";
import { Observable } from "rxjs";

export type ReactiveUnaryMethod<RequestType, ResponseType> = (
  request: RequestType
) => Promise<ResponseType>;

export type ReactiveClientStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>
) => Promise<ResponseType>;

export type ReactiveServerStreamMethod<RequestType, ResponseType> = (
  request: RequestType
) => Observable<ResponseType>;

export type ReactiveBidirectionalStreamMethod<RequestType, ResponseType> = (
  request: Observable<RequestType>
) => Observable<Response>;

export type ReactiveMethod<RequestType, ResponseType> =
  | ReactiveUnaryMethod<RequestType, ResponseType>
  | ReactiveClientStreamMethod<RequestType, ResponseType>
  | ReactiveServerStreamMethod<RequestType, ResponseType>
  | ReactiveBidirectionalStreamMethod<RequestType, ResponseType>;

type DereactifyMethod<
  RequestType,
  ResponseType,
  ReactiveMethodType extends ReactiveMethod<RequestType, ResponseType>
> = ReactiveMethodType extends ReactiveUnaryMethod<RequestType, ResponseType>
  ? grpc.handleUnaryCall<RequestType, ResponseType>
  : ReactiveMethodType extends ReactiveClientStreamMethod<
      RequestType,
      ResponseType
    >
  ? grpc.handleClientStreamingCall<RequestType, ResponseType>
  : ReactiveMethodType extends ReactiveServerStreamMethod<
      RequestType,
      ResponseType
    >
  ? grpc.handleServerStreamingCall<RequestType, ResponseType>
  : ReactiveMethodType extends ReactiveBidirectionalStreamMethod<
      RequestType,
      ResponseType
    >
  ? grpc.handleBidiStreamingCall<RequestType, ResponseType>
  : never;

export function defineMethod<
  RequestType,
  ResponseType,
  ReactiveMethodType extends ReactiveMethod<RequestType, ResponseType>
>(
  method: ReactiveMethod<RequestType, ResponseType>
): DereactifyMethod<RequestType, ResponseType, ReactiveMethodType> {
  return (null as unknown) as DereactifyMethod<
    RequestType,
    ResponseType,
    ReactiveMethodType
  >;
}
