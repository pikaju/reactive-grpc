import { Observable, } from 'rxjs';

interface Stream {
  on(
    event: 'data' | 'error' | 'end',
    listener: (data: unknown) => void
  ): unknown;
  removeListener(
    event: 'data' | 'error' | 'end',
    listener: (data: unknown) => void
  ): unknown;
  cancel?(): void;
}

/**
 * Maps a regular stream object onto an RxJS `Observable` for the client to read.
 * Only `"data"`, `"error"` and `"end"` events will be transformed.
 * @param stream The stream to be transformed into an `Observable`.
 * @param cancelOnUnsubscribe If set to true, subscribing to, and subsequently
 * unsubscribing from the returned `Observable` will result in the cancellation of the stream.
 * Errors caused by the cancellation will be ignored.
 */
export function observableFromStream<T>(stream: Stream, cancelOnUnsubscribe?: boolean): Observable<T> {
  return new Observable<T>((subscriber) => {
    function dataHandler(data: unknown) {
      subscriber.next(data as T);
    }

    function errorHandler(error: unknown) {
      subscriber.error(error);
    }

    function endHandler() {
      subscriber.complete();
    }

    stream.on('data', dataHandler);
    stream.on('error', errorHandler);
    stream.on('end', endHandler);

    return () => {
      stream.removeListener('data', dataHandler);
      stream.removeListener('error', errorHandler);
      stream.removeListener('end', endHandler);
      if (cancelOnUnsubscribe && stream.cancel) {
        stream.on('error', () => {
          // Tollerate cancelling by listening for errors and ignoring them.
        });
        stream.cancel();
      }
    };
  });
}
