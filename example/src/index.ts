import { ExampleService, IExampleServer } from './generated/service_grpc_pb';
import { reactifyService } from 'grpc-rxjs';

reactifyService<IExampleServer>(ExampleService, {
  addTwoNumbers() {

  }
});