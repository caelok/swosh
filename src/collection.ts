/**
 * swosh collection - by æ’’
 */
import { StorageEngine } from './storage/engine';
import { generateId } from './utils';
import { Packr } from 'msgpackr';
import { Query } from './query';

export interface Document {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class Collection<T extends Document> {
  constructor(
    private name: string,
    private storage: StorageEngine,
    private packr: Packr
  ) {}

  /**
   * insert a document into the collection
   * @param doc - document to insert
   */
  async insert(doc: Omit<T, '_id'>): Promise<T> {
    const now = new Date().toISOString();
    const _id = generateId();
    const document = {
      ...doc,
      _id,
      createdAt: now,
      updatedAt: now,
    } as T;

    const encoded = this.packr.pack(document);
    await this.storage.write(this.name, _id, encoded);
    return document;
  }

  /**
   * insert multiple documents into the collection
   * @param docs - array of documents to insert
   */
  async insertMany(docs: Omit<T, '_id'>[]): Promise<T[]> {
    const promises = docs.map((doc) => this.insert(doc));
    return Promise.all(promises);
  }

  /**
   * find documents matching the query
   * @param filter - query filter
   */
  find(filter: Partial<T> = {}): Query<T> {
    return new Query<T>(this.name, this.storage, this.packr, filter);
  }

  /**
   * find one document matching the query
   * @param filter - query filter
   */
  async findOne(filter: Partial<T> = {}): Promise<T | null> {
    const results = await this.find(filter).limit(1).exec();
    return results[0] || null;
  }

  /**
   * find document by id
   * @param id - document id
   */
  async findById(id: string): Promise<T | null> {
    const data = await this.storage.read(this.name, id);
    if (!data) return null;
    return this.packr.unpack(data) as T;
  }

  /**
   * update documents matching the filter
   * @param filter - query filter
   * @param update - update operations
   */
  async update(filter: Partial<T>, update: Partial<T>): Promise<number> {
    const docs = await this.find(filter).exec();
    const updates = docs.map(async (doc) => {
      const updated = {
        ...doc,
        ...update,
        _id: doc._id,
        updatedAt: new Date().toISOString(),
      };
      const encoded = this.packr.pack(updated);
      await this.storage.write(this.name, doc._id!, encoded);
      return true;
    });
    const results = await Promise.all(updates);
    return results.length;
  }

  /**
   * update one document matching the filter
   * @param filter - query filter
   * @param update - update operations
   */
  async updateOne(filter: Partial<T>, update: Partial<T>): Promise<boolean> {
    const doc = await this.findOne(filter);
    if (!doc) return false;

    // Corregido: Convertimos el _id a un objeto que coincida con Partial<T>
    const filterById = { _id: doc._id } as Partial<T>;
    await this.update(filterById, update);
    return true;
  }

  /**
   * update document by id
   * @param id - document id
   */
  async updateById(id: string, update: Partial<T>): Promise<boolean> {
    const filterById = { _id: id } as Partial<T>;
    return this.updateOne(filterById, update);
  }

  /**
   * delete documents matching the filter
   * @param filter - query filter
   */
  async delete(filter: Partial<T>): Promise<number> {
    const docs = await this.find(filter).exec();
    const deletions = docs.map((doc) =>
      this.storage.delete(this.name, doc._id!)
    );
    await Promise.all(deletions);
    return docs.length;
  }

  /**
   * delete one document matching the filter
   * @param filter - query filter
   */
  async deleteOne(filter: Partial<T>): Promise<boolean> {
    const doc = await this.findOne(filter);
    if (!doc) return false;

    await this.storage.delete(this.name, doc._id!);
    return true;
  }

  /**
   * delete document by id
   * @param id - document id
   */
  async deleteById(id: string): Promise<boolean> {
    const filterById = { _id: id } as Partial<T>;
    return this.deleteOne(filterById);
  }

  /**
   * count documents matching the filter
   * @param filter - query filter
   */
  async count(filter: Partial<T> = {}): Promise<number> {
    const docs = await this.find(filter).exec();
    return docs.length;
  }
}
