import * as grpc from "grpc";

import { TwoNumbers } from "../generated/service_pb";
import { ExampleClient, ExampleService } from "../generated/service_grpc_pb";

import { reactifyClient } from "reactive-grpc";

async function testServer(port: string) {
  console.log(`Testing server "${port}:"`);
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

  await addTwoNumbersTest(3, 5);
  console.log("");
}

(async () => {
  await testServer("localhost:5001");
  await testServer("localhost:5002");
})();
