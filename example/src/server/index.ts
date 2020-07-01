import * as grpc from "grpc";

import { ExampleService, IExampleServer } from "../generated/service_grpc_pb";

import DefineMethodsExampleService from "./methods";
import defineServiceExampleService from "./service";

function launchServer(service: IExampleServer, port: string) {
  const server = new grpc.Server();
  server.addService(ExampleService, service);
  server.bind(port, grpc.ServerCredentials.createInsecure());
  server.start();
}

launchServer(new DefineMethodsExampleService(), "0.0.0.0:5001");
launchServer(defineServiceExampleService, "0.0.0.0:5002");
console.log("Servers running.");
