/**
 * Unified gRPC metadata class.
 */
export class Metadata {
  private data = new Map<string, string>();

  /**
   * Creates a metadata object from a plain JavaScript object.
   * @param object Key-value object.
   * @returns A Metadata instance with the same key value pairs.
   */
  static fromObject(object: Record<string, string>): Metadata {
    const metadata = new Metadata();
    for (const key of Object.keys(object)) {
      metadata.set(key, object[key]);
    }
    return metadata;
  }

  /**
   * Converts this metadata instance into a plain JavaScript object.
   * @returns Object containing key value pairs.
   */
  toObject(): Record<string, string> {
    const object: Record<string, string> = {};
    this.data.forEach((value, key) => {
      object[key] = value;
    });
    return object;
  }

  /**
   * Retrieves a string value from this metadata map.
   * @param key Key of the key value pair.
   * @returns The value.
   */
  get(key: string): string | undefined {
    return this.data.get(key);
  }

  /**
   * Sets a key value pair of the metadata map.
   * @param key Key of the key value pair.
   * @param value New value to insert.
   */
  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  /**
   * Sets a key value pair of the metadata map.
   * @param key Key of the key value pair.
   * @returns `true` if an element in the Map object existed and has been
   * removed, or `false` if the element does not exist.
   */
  delete(key: string): boolean {
    return this.data.delete(key);
  }
}
