import { Observable } from "rxjs";

export function observableFromStream<T>(stream: NodeJS.ReadableStream) {
  return new Observable<T>((subscriber) => {
    function errorHandler(error: any) {
      subscriber.error(error);
      subscriber.complete();
    }
    stream.on("data", subscriber.next);
    stream.on("error", errorHandler);
    stream.on("end", subscriber.complete);
    return () => {
      stream.removeListener("data", subscriber.next);
      stream.removeListener("error", errorHandler);
      stream.removeListener("end", subscriber.complete);
    };
  });
}
