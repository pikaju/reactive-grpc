import * as grpc from '@grpc/grpc-js';
import { Metadata } from '../common/metadata';
export { Metadata } from '../common/metadata';

declare module '../common/metadata' {
  namespace Metadata {
    /**
     * Converts a metadata object from the @grpc/grpc-js runtime library into a unified {@link Metadata} instance.
     * @param metadata @grpc/grpc-js runtime library metadata instance.
     * @returns The replicated reactive-grpc metadata instance.
     */
    function fromGrpcType(metadata: grpc.Metadata): Metadata;
  }

  interface Metadata {
    /**
     * Converts this metadata object to an instance of the Metadata class from the @grpc/grpc-js runtime library.
     * @returns @grpc/grpc-js runtime library metadata instance.
     */
    toGrpcType(): grpc.Metadata;
  }
}

Metadata.fromGrpcType = function(metadata: grpc.Metadata): Metadata {
  const sourceMap = metadata.getMap();
  const copy = new Metadata();
  for (const key of Object.keys(sourceMap)) {
    copy.set(key, sourceMap[key].toString());
  }
  return copy;
}

Metadata.prototype.toGrpcType = function() {
  const object = this.toObject();
  const copy = new grpc.Metadata();
  for (const key of Object.keys(object)) {
    copy.set(key, object[key]);
  }
  return copy;
}
