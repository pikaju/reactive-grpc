import { interval, Observable } from 'rxjs';
import { map, reduce } from 'rxjs/operators';

import { defineService } from 'reactive-grpc/node';

import { OneNumber, TwoNumbers, Empty } from '../generated/service_pb';
import { ExampleService, IExampleServer } from '../generated/service_grpc_pb';

/** Reactive server of the example service. */
export default defineService<IExampleServer>(ExampleService, {
  async addTwoNumbers(request: TwoNumbers): Promise<OneNumber> {
    return new OneNumber().setA(request.getA() + request.getB());
  },
  addStreamOfNumbers(request: Observable<OneNumber>): Promise<OneNumber> {
    return request
      .pipe(
        reduce((acc, value) => acc + value.getA(), 0),
        map((value) => new OneNumber().setA(value))
      )
      .toPromise();
  },
  getFibonacciSequence(request: Empty): Observable<OneNumber> {
    let a = 0;
    let b = 1;
    return interval(100).pipe(
      map(() => {
        const next = a + b;
        a = b;
        b = next;
        return new OneNumber().setA(a);
      })
    );
  },
  runningAverage(request: Observable<OneNumber>): Observable<OneNumber> {
    let average = 0;
    return request.pipe(
      map((value, index) => {
        average = (value.getA() + index * average) / (index + 1);
        return new OneNumber().setA(average);
      })
    );
  },
});
