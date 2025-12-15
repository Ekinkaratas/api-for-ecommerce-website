abstract class Seeder<T> {
  protected count: number;
  protected _data: T[] = [];

  constructor(count: number) {
    this.count = count;
  }

  protected abstract createData(): void;

  get data(): T[] {
    return this._data;
  }
}

export default Seeder;
