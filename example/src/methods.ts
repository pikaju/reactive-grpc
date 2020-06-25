import { interval, Observable } from "rxjs";
import { map, reduce } from "rxjs/operators";
import { OneNumber, TwoNumbers, Empty } from "./generated/service_pb";
import { IExampleServer } from "./generated/service_grpc_pb";
import { defineMethod } from "reactive-grpc";

class ExampleServer implements IExampleServer {
  addTwoNumbers = defineMethod(async function (
    request: TwoNumbers
  ): Promise<OneNumber> {
    return new OneNumber().setA(request.getA() + request.getB());
  });
  addStreamOfNumbers = defineMethod(function (
    request: Observable<OneNumber>
  ): Promise<OneNumber> {
    return request
      .pipe(
        reduce((acc, value) => acc + value.getA(), 0),
        map((value) => new OneNumber().setA(value))
      )
      .toPromise();
  });
  getFibonacciSequence = defineMethod(function (
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
  runningAverage = defineMethod(function (
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
