import { interval, Observable } from "rxjs";
import { map, reduce } from "rxjs/operators";

import {
  defineUnaryMethod,
  defineClientStreamMethod,
  defineServerStreamMethod,
  defineBidirectionalStreamMethod,
} from "reactive-grpc";

import { OneNumber, TwoNumbers, Empty } from "../generated/service_pb";
import { IExampleServer } from "../generated/service_grpc_pb";

export default class ExampleServer implements IExampleServer {
  addTwoNumbers = defineUnaryMethod(async function (
    request: TwoNumbers
  ): Promise<OneNumber> {
    return new OneNumber().setA(request.getA() + request.getB());
  });
  addStreamOfNumbers = defineClientStreamMethod(function (
    request: Observable<OneNumber>
  ): Promise<OneNumber> {
    return request
      .pipe(
        reduce((acc, value) => acc + value.getA(), 0),
        map((value) => new OneNumber().setA(value))
      )
      .toPromise();
  });
  getFibonacciSequence = defineServerStreamMethod(function (
    request: Empty
  ): Observable<OneNumber> {
    let a = 0;
    let b = 1;
    return interval(1000).pipe(
      map(() => {
        let next = a + b;
        a = b;
        b = next;
        return new OneNumber().setA(next);
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
        return new OneNumber().setA(average);
      })
    );
  });
}
