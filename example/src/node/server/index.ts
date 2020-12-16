import * as grpc from '@grpc/grpc-js';

import { ExampleService, IExampleServer } from '../generated/service_grpc_pb';

import DefineMethodsExampleService from './methods';
import defineServiceExampleService from './service';

async function launchServer(service: IExampleServer, port: string) {
  const server = new grpc.Server();
  server.addService(ExampleService, service as unknown as grpc.UntypedServiceImplementation);
  await new Promise((resolve, reject) => {
    server.bindAsync(
      port,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => (error ? reject(error) : resolve(port))
    );
  });
  server.start();
}

(async () => {
  await launchServer(new DefineMethodsExampleService(), '0.0.0.0:5001');
  await launchServer(defineServiceExampleService, '0.0.0.0:5002');
  console.log('Servers running.');
})();
