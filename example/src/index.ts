import { ExampleService, IExampleServer } from './generated/service_grpc_pb';
import { defineService } from 'grpc-rxjs';

defineService<IExampleServer>(ExampleService, {
  addTwoNumbers() {

  }
});