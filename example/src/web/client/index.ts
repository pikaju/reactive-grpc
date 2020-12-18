import { map, take } from 'reactive-grpc/node_modules/rxjs/operators/';

import { reactifyWebClient } from 'reactive-grpc/dist/web';

import { ExampleClient } from '../generated/service_grpc_web_pb';
import { Empty, TwoNumbers } from '../generated/service_pb';

async function testServer(port: string) {
  console.log(`Testing server "${port}":`);
  const client = new ExampleClient(port);
  const reactiveClient = reactifyWebClient(client);

  async function addTwoNumbersTest(a: number, b: number) {
    console.log(`Testing addTwoNumbers with a=${a} and b=${b}...`);
    const response = await reactiveClient.addTwoNumbers(
      new TwoNumbers().setA(a).setB(b)
    );
    console.log(`Result: ${response.getA()}`);
  }

  async function getFibonacciSequenceTest(count: number) {
    console.log(`Testing getFibonacciSequence with ${count} numbers...`);
    const response = reactiveClient.getFibonacciSequence(new Empty());
    console.log('got observable');
    console.log('Result: ');
    await response
      .pipe(
        take(count),
        map((value) => console.log(`${value} `))
      )
      .toPromise();
    console.log('');
  }

  await addTwoNumbersTest(3, 5);
  await getFibonacciSequenceTest(5);
  console.log('');
}

(async () => {
  await testServer('http://localhost:4001');
  await testServer('http://localhost:4002');
})();
