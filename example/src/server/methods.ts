import { interval, Observable } from "rxjs";
import { map, reduce } from "rxjs/operators";

import {
  defineUnaryMethod,
  defineRequestStreamMethod,
  defineResponseStreamMethod,
  defineBidirectionalStreamMethod,
} from "reactive-grpc";

import { OneNumber, TwoNumbers, Empty } from "../generated/service_pb";
import { IExampleServer } from "../generated/service_grpc_pb";

export default class ExampleServer implements IExampleServer {
  addTwoNumbers = defineUnaryMethod(async function (
    request: TwoNumbers
  ): Promise<OneNumber> {
    const result = new OneNumber();
    result.setA(request.getA() + request.getB());
    return result;
  });
  addStreamOfNumbers = defineRequestStreamMethod(function (
    request: Observable<OneNumber>
  ): Promise<OneNumber> {
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
  });
  getFibonacciSequence = defineResponseStreamMethod(function (
    request: Empty
  ): Observable<OneNumber> {
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
  });
  runningAverage = defineBidirectionalStreamMethod(function (
    request: Observable<OneNumber>
  ): Observable<OneNumber> {
    let average = 0;
    return request.pipe(
      map((value, index) => {
        average = (value.getA() + index * average) / (index + 1);
        const result = new OneNumber();
        result.setA(average);
        return result;
      })
    );
  });
}
