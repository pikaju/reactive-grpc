import { Observable } from "rxjs";
import * as grpc from "grpc";

/**
 * Maps a regular stream object onto an RxJS `Observable` for the client to read.
 * Only `"data"`, `"error"` and `"end"` events will be transformed.
 * Subscribing to, and subsequently unsubscribing from the returned `Observable`
 * will result in the cancellation of the stream.
 * @param stream The stream to be transformed into an `Observable`.
 */
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

/**
 * Maps a regular stream object onto an RxJS `Observable` for the server to read.
 * Only `"data"`, `"error"` and `"end"` events will be transformed.
 * @param stream The stream to be transformed into an `Observable`.
 */
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
