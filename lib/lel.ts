// import { Observable, of } from "rxjs"
// import { callError } from "grpc/src/constants";

// type KackMethod<Request, Response> = (call: Request, callback: Response) => void;

// type GeileMethod<Request, Response> = (request: Observable<Request>) => Observable<Response>;

// /*
// interface IKekService {
//   getKekStream(call: number, callback: boolean) : void;
// }

// interface ILelService {
//   getLelStream(call: number, callback: boolean) : void;
// }

// function reactify<Request, Response>(kek: GeileMethod<Request, Response>): KackMethod<Request, Response> {
//   return (call: number, callback: boolean) => {
//     const request = new Observable<Parameters<kek[lel]>[0]>;
//     call.on('data', request.next);
//     call.on('error', request.error);
//     kek[lel](request).subscribe({
//       next: callback,
//       // error: ...
//       // comple: ...
//     });
//     };
// }

// class GeilerService implements IKekService {
//   getKekStream = reactify((pip: Observable<boolean>) => {
//     return pip;
//   });
// }
// */

// interface NicerDoppelService {

// }

// export function defineService<IService>(service, kek: ReactifyService<IService>) : IService {
//   const pip = {};
//   for (let key in service) {
//     if (!kek[key]) process.exit(1);

//     pip[key] = (call: any, callback: any) => {
//       const observable = new Observable<any>((subscribe) => {
//         call.on('data', subscribe.next);
//         call.on('error', subscribe.error);
//         call.on('end', subscribe.complete);
//       });

//       (kek[key](observable) as Observable<any>).subscribe({
//         next: result => callback(null, result),
//         error: (err) => callback(err),
//         complete: call.end,
//       });
//     };
//   }
//   return { pip as IService, service };
// }
