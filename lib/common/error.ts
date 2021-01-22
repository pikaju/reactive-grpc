/**
 * Reactive error type for gRPC errors.
 */
export class RpcError extends Error {
  constructor(
    public code: RpcError.StatusCode,
    public description: string,
  ) {
    super(`Status Code ${code} (${RpcError.StatusCode[code]}): "${description}"`);
  }
}

export namespace RpcError {
  /**
   * Enumeration of all available gRPC status codes.
   * @see {@link https://developers.google.com/maps-booking/reference/grpc-api/status_codes}
   */
  export enum StatusCode {
    OK = 0,
    CANCELLED = 1,
    UNKNOWN = 2,
    INVALID_ARGUMENT = 3,
    DEADLINE_EXCEEDED = 4,
    NOT_FOUND = 5,
    ALREADY_EXISTS = 6,
    PERMISSION_DENIED = 7,
    RESOURCE_EXHAUSTED = 8,
    FAILED_PRECONDITION = 9,
    ABORTED = 10,
    OUT_OF_RANGE = 11,
    UNIMPLEMENTED = 12,
    INTERNAL = 13,
    UNAVAILABLE = 14,
    DATA_LOSS = 15,
    UNAUTHENTICATED = 16,
  }
}
