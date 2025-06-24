/**
 * swosh engine - by æ’’
 */

export interface StorageEngine {
  write(collection: string, id: string, data: Uint8Array): Promise<void>;
  read(collection: string, id: string): Promise<Uint8Array | null>;
  readAll(collection: string): Promise<Uint8Array[]>;
  delete(collection: string, id: string): Promise<void>;
  close(): Promise<void>;
}
