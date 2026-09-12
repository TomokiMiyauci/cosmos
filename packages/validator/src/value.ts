export class Unknown {
  #value: unknown;

  constructor(value: unknown) {
    this.#value = value;
  }

  get value(): unknown {
    return this.#value;
  }
}
