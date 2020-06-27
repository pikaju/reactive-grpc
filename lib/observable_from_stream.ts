import { Observable } from "rxjs";

export function observableFromStream<T>(stream: NodeJS.ReadableStream) {
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
