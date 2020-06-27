import { Observable } from "rxjs";

export function observableFromStream<T>(stream: NodeJS.ReadableStream) {
  return new Observable<T>((observable) => {
    function errorHandler(error: any) {
      observable.error(error);
      observable.complete();
    }
    stream.on("data", observable.next);
    stream.on("error", errorHandler);
    stream.on("end", observable.complete);
    return () => {
      stream.removeListener("data", observable.next);
      stream.removeListener("error", errorHandler);
      stream.removeListener("end", observable.complete);
    };
  });
}
