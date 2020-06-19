// import { bindCallback } from "rxjs";
// import { callError } from "grpc/src/constants";

// class KekService extends ReactifyService<IKekService> {

//     getKekStream = reactify((request: Observable<HelloResponse>, metadata) => {
//         return request.pipe(map(kek => 5), take(5));
//     });
// }

// function reactify<Request, Response>(lel) {
//   return (call: GrpcCallBackObjectWIthMetadata<Grpc::lel>) =>
//     lel(from(request))

//     var observable = new Observable<Request>();
//     call.on('data', observable.next);
//     const response = lel(observable, call.metadata);

//     response.subscribe({
//       next: kek => call.result(feddich: false, kek),
//       end: kek call.(feddich: true
//       error: err => call.error(err)
//       })
// }
