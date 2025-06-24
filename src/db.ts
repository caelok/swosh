/**
 * swosh db - by æ’’
 */
import { StorageEngine } from './storage/engine';
import { FileStorage } from './storage/file';
import { Collection } from './collection';
import { Document } from './collection';
import { Packr } from 'msgpackr';

export interface DbOptions {
  storage?: StorageEngine;
  path?: string;
}

export class SwoshDb {
  private packr: Packr;
  private storage: StorageEngine;
  private collections: Map<string, Collection<any>>;

  constructor(options: DbOptions = {}) {
    this.packr = new Packr();
    this.storage = options.storage || new FileStorage(options.path || './data');
    this.collections = new Map();
  }

  /**
   * get or create a collection
   * @param name - collection name
   */
  collection<T extends Document>(name: string): Collection<T> {
    if (!this.collections.has(name)) {
      this.collections.set(
        name,
        new Collection<T>(name, this.storage, this.packr)
      );
    }
    return this.collections.get(name) as Collection<T>;
  }

  /**
   * close the database connection
   */
  async close(): Promise<void> {
    await this.storage.close();
  }
}
