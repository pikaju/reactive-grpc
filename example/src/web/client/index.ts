import * as grpc from 'grpc-web';

import { ExampleClient, ExamplePromiseClient } from '../generated/service_grpc_web_pb';
import { TwoNumbers } from '../generated/service_pb';

async function testServer(port: string) {
  console.log(`Testing server "${port}":`);
  const client = new ExamplePromiseClient(port);
  console.log((await client.addTwoNumbers(new TwoNumbers().setA(5).setB(6))).getA());

  // async function addTwoNumbersTest(a: number, b: number) {
  //   console.log(`Testing addTwoNumbers with a=${a} and b=${b}...`);
  //   const response = await reactiveClient.addTwoNumbers(
  //     new TwoNumbers().setA(a).setB(b)
  //   );
  //   console.log(`Result: ${response.getA()}`);
  // }

  // async function getFibonacciSequenceTest(count: number) {
  //   console.log(`Testing getFibonacciSequence with ${count} numbers...`);
  //   const response = reactiveClient.getFibonacciSequence(new Empty());
  //   process.stdout.write("Result: ");
  //   await response
  //     .pipe(
  //       take(count),
  //       map((value) => process.stdout.write(`${value} `))
  //     )
  //     .toPromise();
  //   console.log("");
  // }

  // await addTwoNumbersTest(3, 5);
  // await getFibonacciSequenceTest(5);
  console.log("");
}

(async () => {
  await testServer("http://localhost:4001");
  await testServer("http://localhost:4002");
})();
