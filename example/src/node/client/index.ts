import * as grpc from '@grpc/grpc-js';
import { from } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { reactifyNodeClient } from 'reactive-grpc/node';

import { TwoNumbers, OneNumber, Empty } from '../generated/service_pb';
import { ExampleClient, ExampleService } from '../generated/service_grpc_pb';

async function testServer(port: string) {
  console.log(`Testing server "${port}":`);
  const client = new ExampleClient(port, grpc.credentials.createInsecure());
  const reactiveClient = reactifyNodeClient(ExampleService, client);

  async function addTwoNumbersTest(a: number, b: number) {
    console.log(`Testing addTwoNumbers with a=${a} and b=${b}...`);
    const response = await reactiveClient.addTwoNumbers(
      new TwoNumbers().setA(a).setB(b)
    );
    console.log(`Result: ${response.getA()}`);
  }

  async function addStreamOfNumbersTest(numbers: Array<number>) {
    console.log(`Testing addSteamOfNumbers with ${numbers}...`);
    const response = await reactiveClient.addStreamOfNumbers(
      from(numbers).pipe(map((value: number) => new OneNumber().setA(value)))
    );
    console.log(`Result: ${response.getA()}`);
  }

  async function getFibonacciSequenceTest(count: number) {
    console.log(`Testing getFibonacciSequence with ${count} numbers...`);
    const response = reactiveClient.getFibonacciSequence(new Empty());
    process.stdout.write('Result: ');
    await response
      .pipe(
        take(count),
        map((value) => process.stdout.write(`${value} `))
      )
      .toPromise();
    console.log('');
  }

  async function runningAverageTest(numbers: Array<number>) {
    console.log(`Testing runningAverage with ${numbers}...`);
    const response = reactiveClient.runningAverage(
      from(numbers).pipe(map((value: number) => new OneNumber().setA(value)))
    );
    process.stdout.write('Result: ');
    await response
      .pipe(map((value) => process.stdout.write(`${value.getA()} `)))
      .toPromise();
    console.log('');
  }

  await addTwoNumbersTest(3, 5);
  await addStreamOfNumbersTest([1, 2, 3, 4]);
  await getFibonacciSequenceTest(5);
  await runningAverageTest([0, 10, 20, 50]);
  console.log('');
}

(async () => {
  await testServer('localhost:5001');
  await testServer('localhost:5002');
})();
