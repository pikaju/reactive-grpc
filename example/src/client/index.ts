import * as grpc from "grpc";
import { from } from "rxjs";
import { map, take, catchError } from "rxjs/operators";

import { TwoNumbers, OneNumber, Empty } from "../generated/service_pb";
import { ExampleClient, ExampleService } from "../generated/service_grpc_pb";

import { reactifyClient } from "reactive-grpc";

async function testServer(port: string) {
  console.log(`Testing server "${port}":`);
  const client = new ExampleClient(port, grpc.credentials.createInsecure());
  const reactiveClient = reactifyClient(ExampleService, client);

  async function addTwoNumbersTest(a: number, b: number) {
    console.log(`Testing addTwoNumbers with a=${a} and b=${b}...`);
    const request = new TwoNumbers();
    request.setA(a);
    request.setB(b);
    const response = await reactiveClient.addTwoNumbers(request);
    console.log(`Result: ${response.getA()}`);
  }

  async function addStreamOfNumbersTest(numbers: Array<number>) {
    console.log(`Testing addSteamOfNumbers with ${numbers}...`);
    const response = await reactiveClient.addStreamOfNumbers(
      from(numbers).pipe(
        map((value: number) => {
          const oneNumber = new OneNumber();
          oneNumber.setA(value);
          return oneNumber;
        })
      )
    );
    console.log(`Result: ${response.getA()}`);
  }

  async function getFibonacciSequenceTest(count: number) {
    console.log(`Testing getFibonacciSequence with ${count} numbers...`);
    const response = reactiveClient.getFibonacciSequence(new Empty());
    process.stdout.write("Result: ");
    await response
      .pipe(
        take(count),
        map((value) => process.stdout.write(`${value} `))
      )
      .toPromise();
    console.log("");
  }

  await addTwoNumbersTest(3, 5);
  await addStreamOfNumbersTest([1, 2, 3, 4]);
  await getFibonacciSequenceTest(5);
  console.log("");
}

(async () => {
  await testServer("localhost:5001");
  await testServer("localhost:5002");
})();
