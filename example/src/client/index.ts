import * as grpc from "grpc";

import { ExampleClient, ExampleService } from "../generated/service_grpc_pb";

import { reactifyClient } from 'reactive-grpc';

const client = new ExampleClient('localhost:5001', grpc.credentials.createInsecure());
const reactiveClient = reactifyClient(ExampleService, client);
client.addTwoNumbers