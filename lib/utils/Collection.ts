export interface Collection<T, K> {
  objects: any;
  limit: number;
}

export class Collection<T, K> extends Map {
  private arr?: K[] | null;
  constructor(objects: any, limit: number) {
    super();
    this.objects = objects;
    this.limit = limit;
  }

  public get<T>(key: T): T | undefined {
    return super.get(key);
  }

  public resolve<T>(key: T): T {
    return super.get(key);
  }

  public has(key: T): boolean {
    return super.has(key);
  }

  public set<T>(key: string, value: any): T | this {
    super.set(key, value);
    return super.get(key);
  }

  public clear(): void {
    return super.clear();
  }

  public delete(key: T): boolean {
    this.arr = null;
    return super.delete(key);
  }

  public array(): K[] {
    if (this.arr?.length !== this.size) this.arr = [...this.values()];
    return this.arr;
  }

  public filter(key: any) {
    const values = [];
    for (const item of this.values()) {
      if (key(item)) {
        values.push(item);
      }
    }
    return values;
  }

  public find(key: any) {
    for (const item of this.values()) {
      if (key(item)) {
        return item;
      }
    }
    return undefined;
  }

  public map(key: any) {
    const values = [];
    for (const item of this.values()) {
      values.push(key(item));
    }
    return values;
  }

  public random(): K | K[] {
    let values = this.array();
    if (!values.length) return [];
    return values[Math.floor(Math.random() * values.length)];
  }

  public some(key: (item: K) => boolean) {
    const values = [...this.values()];
    for (const item of values) {
      if (key(item)) return true;
    }
    return false;
  }
}
