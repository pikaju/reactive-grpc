import * as grpc from "@grpc/grpc-js";

// @ts-ignore
import { Example, IExampleServer } from "../generated/service_grpc_pb";

import DefineMethodsExampleService from "./methods";
import defineServiceExampleService from "./service";

async function launchServer(service: IExampleServer, port: string) {
  const server = new grpc.Server();
  // @ts-ignore
  server.addService(Example, service);
  await new Promise((resolve, reject) => {
    server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (error, port) => error ? reject(error) : resolve(port));
  });
  server.start();
}

(async () => {
  launchServer(new DefineMethodsExampleService(), "0.0.0.0:5001");
  launchServer(defineServiceExampleService, "0.0.0.0:5002");
  console.log("Servers running.");
})();
