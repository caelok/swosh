/**
 * swosh file - by æ’’
 */

import { StorageEngine } from './engine';
import { promises as fs } from 'fs';
import { join } from 'path';

export class FileStorage implements StorageEngine {
  constructor(private basePath: string) {
    this.init();
  }

  private async init(): Promise<void> {
    await fs.mkdir(this.basePath, { recursive: true });
  }

  private getCollectionPath(collection: string): string {
    return join(this.basePath, collection);
  }

  private getDocumentPath(collection: string, id: string): string {
    return join(this.getCollectionPath(collection), `${id}.msg`);
  }

  async write(collection: string, id: string, data: Uint8Array): Promise<void> {
    const collectionPath = this.getCollectionPath(collection);
    await fs.mkdir(collectionPath, { recursive: true });
    await fs.writeFile(this.getDocumentPath(collection, id), data);
  }

  async read(collection: string, id: string): Promise<Uint8Array | null> {
    try {
      const data = await fs.readFile(this.getDocumentPath(collection, id));
      return new Uint8Array(data);
    } catch (err) {
      return null;
    }
  }

  async readAll(collection: string): Promise<Uint8Array[]> {
    try {
      const collectionPath = this.getCollectionPath(collection);
      const files = await fs.readdir(collectionPath);
      const reads = files
        .filter((file) => file.endsWith('.msg'))
        .map((file) => fs.readFile(join(collectionPath, file)));
      const results = await Promise.all(reads);
      return results.map((buffer) => new Uint8Array(buffer));
    } catch (err) {
      return [];
    }
  }

  async delete(collection: string, id: string): Promise<void> {
    try {
      await fs.unlink(this.getDocumentPath(collection, id));
    } catch (err) {
      // ignore errors if file doesn't exist
    }
  }

  async close(): Promise<void> {
    // nothing to do for file storage
  }
}
