import * as grpc from "grpc";

import { TwoNumbers } from "../generated/service_pb";
import { ExampleClient, ExampleService } from "../generated/service_grpc_pb";

import { reactifyClient } from "reactive-grpc";

const client = new ExampleClient(
  "localhost:5001",
  grpc.credentials.createInsecure()
);
const reactiveClient = reactifyClient(ExampleService, client);

async function addTwoNumbersTest(a: number, b: number) {
  console.log(`Testing addTwoNumbers with a=${a} and b=${b}...`);
  const request = new TwoNumbers();
  request.setA(a);
  request.setB(b);
  const response = await reactiveClient.addTwoNumbers(request);
  console.log(`Result: ${response.getA()}`);
}

(async () => {
  await addTwoNumbersTest(3, 5);
})();
