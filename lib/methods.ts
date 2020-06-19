import { Observable } from "rxjs";

type ReactiveUnaryMethod<Request, Response> = (
  request: Request
) => Promise<Response>;

type ReactiveClientStreamMethod<Request, Response> = (
  request: Observable<Request>
) => Promise<Response>;

type ReactiveServerStreamMethod<Request, Response> = (
  request: Request
) => Observable<Response>;

type ReactiveBidirectionalStreamMethod<Request, Response> = (
  request: Observable<Request>
) => Observable<Response>;
