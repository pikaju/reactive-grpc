import {interval, Observable} from 'rxjs';
import {map, reduce} from 'rxjs/operators';
import { OneNumber, TwoNumbers, Empty } from './generated/service_pb';
import { ExampleService, IExampleServer } from './generated/service_grpc_pb';
import { defineMethod, defineService } from 'reactive-grpc';
import * as grpc from 'grpc';

class ExampleServer implements IExampleServer {
  addTwoNumbers = defineMethod(async function (request: TwoNumbers): Promise<OneNumber> {
    return new OneNumber().setA(request.getA() + request.getB());
  });
  addStreamOfNumbers = defineMethod(function (request: Observable<OneNumber>): Promise<OneNumber> {
    return request.pipe(
      reduce((acc, value) => acc + value.getA(), 0),
      map((value) => new OneNumber().setA(value)),
    ).toPromise();
  });
  getFibonacciSequence = defineMethod(function (request: Empty): Observable<OneNumber> {
    let a = 0;
    let b = 1;
    return interval(1000).pipe(map(() => {
      let next = a + b;
      a = b;
      b = next;
      return new OneNumber().setA(next)
    }));
  });
  runningAverage = defineMethod(function (request: Observable<OneNumber>): Observable<OneNumber> {
    let average = 0;
    return request.pipe(
      map((value, index) => {
        average = (value.getA() + index * average) / (index + 1);
        return new OneNumber().setA(average);
      })
    );
  });
}

defineService<IExampleServer>(ExampleService, {
  async addTwoNumbers(request: TwoNumbers): Promise<OneNumber> {
    return new OneNumber().setA(request.getA() + request.getB());
  },
  addStreamOfNumbers(request: Observable<OneNumber>): Promise<OneNumber> {
    return request.pipe(
      reduce((acc, value) => acc + value.getA(), 0),
      map((value) => new OneNumber().setA(value)),
    ).toPromise();
  },
  getFibonacciSequence(request: Empty): Observable<OneNumber> {
    let a = 0;
    let b = 1;
    return interval(1000).pipe(map(() => {
      let next = a + b;
      a = b;
      b = next;
      return new OneNumber().setA(next)
    }));
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
