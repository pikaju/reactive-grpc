import { OneNumber, TwoNumbers } from './generated/service_pb';
import { ExampleService, IExampleServer } from './generated/service_grpc_pb';
import { defineMethod, defineService } from 'reactive-grpc';

class ExampleServer implements IExampleServer {
  addTwoNumbers = defineMethod(async function (request: TwoNumbers): Promise<OneNumber> {
    return new OneNumber().setA(request.getA() + request.getB());
  });
}

defineService<IExampleServer>(ExampleService, {
  
});