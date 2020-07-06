import { Observable } from "rxjs";
import * as grpc from "grpc";

export function observableFromClientStream<T>(
  stream: grpc.ClientReadableStream<T> | grpc.ClientDuplexStream<any, T>
) {
  return new Observable<T>((subscriber) => {
    function dataHandler(data: any) {
      subscriber.next(data);
    }

    function errorHandler(error: any) {
      subscriber.error(error);
      subscriber.complete();
    }

    function endHandler() {
      subscriber.complete();
    }

    stream.on("data", dataHandler);
    stream.on("error", errorHandler);
    stream.on("end", endHandler);

    return () => {
      stream.removeListener("data", dataHandler);
      stream.removeListener("error", errorHandler);
      stream.removeListener("end", endHandler);
      // Tollerate cancelling by listening for errors and ignoring them.
      stream.on("error", () => {});
      stream.cancel();
    };
  });
}

export function observableFromServerStream<T>(
  stream: grpc.ServerReadableStream<T> | grpc.ServerDuplexStream<T, any>
) {
  return new Observable<T>((subscriber) => {
    function dataHandler(data: any) {
      subscriber.next(data);
    }

    function errorHandler(error: any) {
      subscriber.error(error);
      subscriber.complete();
    }

    function endHandler() {
      subscriber.complete();
    }

    stream.on("data", dataHandler);
    stream.on("error", errorHandler);
    stream.on("end", endHandler);

    return () => {
      stream.removeListener("data", dataHandler);
      stream.removeListener("error", errorHandler);
      stream.removeListener("end", endHandler);
    };
  });
}
