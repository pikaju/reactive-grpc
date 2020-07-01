import { interval, Observable } from "rxjs";
import { map, reduce } from "rxjs/operators";

import { defineService } from "reactive-grpc";

import { OneNumber, TwoNumbers, Empty } from "../generated/service_pb";
// @ts-ignore
import { Example, IExampleServer } from "../generated/service_grpc_pb";

export default defineService<IExampleServer>(Example, {
  async addTwoNumbers(request: TwoNumbers): Promise<OneNumber> {
    const result = new OneNumber();
    result.setA(request.getA() + request.getB());
    return result;
  },
  addStreamOfNumbers(request: Observable<OneNumber>): Promise<OneNumber> {
    return request
      .pipe(
        reduce((acc, value) => acc + value.getA(), 0),
        map((value) => {
          const result = new OneNumber();
          result.setA(value);
          return result;
        })
      )
      .toPromise();
  },
  getFibonacciSequence(request: Empty): Observable<OneNumber> {
    let a = 0;
    let b = 1;
    return interval(100).pipe(
      map(() => {
        let next = a + b;
        a = b;
        b = next;
        const result = new OneNumber();
        result.setA(a);
        return result;
      })
    );
  },
  runningAverage(request: Observable<OneNumber>): Observable<OneNumber> {
    let average = 0;
    return request.pipe(
      map((value, index) => {
        average = (value.getA() + index * average) / (index + 1);
        const result = new OneNumber();
        result.setA(average);
        return result;
      })
    );
  },
});
