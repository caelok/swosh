/**
 * swosh query - by æ’’
 */
import { StorageEngine } from './storage/engine';
import { Document } from './collection';
import { Packr } from 'msgpackr';

export class Query<T extends Document> {
  private limitValue: number = 0;
  private skipValue: number = 0;
  private sortField?: keyof T;
  private sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private collection: string,
    private storage: StorageEngine,
    private packr: Packr,
    private filter: Partial<T> = {}
  ) {}

  /**
   * limit the number of results
   * @param n - limit value
   */
  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  /**
   * skip the first n results
   * @param n - skip value
   */
  skip(n: number): this {
    this.skipValue = n;
    return this;
  }

  /**
   * sort results by field
   * @param field - field to sort by
   * @param order - sort order
   */
  sort(field: keyof T, order: 'asc' | 'desc' = 'asc'): this {
    this.sortField = field;
    this.sortOrder = order;
    return this;
  }

  /**
   * execute the query
   */
  async exec(): Promise<T[]> {
    const documents = await this.storage.readAll(this.collection);

    let results = documents
      .map((doc) => this.packr.unpack(doc) as T)
      .filter((doc) => this.matchesFilter(doc));

    if (this.sortField) {
      results.sort((a, b) => {
        const aVal = a[this.sortField!];
        const bVal = b[this.sortField!];
        return this.sortOrder === 'asc'
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
            ? 1
            : -1;
      });
    }

    if (this.skipValue) {
      results = results.slice(this.skipValue);
    }

    if (this.limitValue) {
      results = results.slice(0, this.limitValue);
    }

    return results;
  }

  private matchesFilter(doc: T): boolean {
    return Object.entries(this.filter).every(([key, value]) => {
      return doc[key] === value;
    });
  }
}
