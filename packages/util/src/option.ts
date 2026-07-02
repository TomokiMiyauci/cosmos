export type Option<T> = Option.Some<T> | Option.None;

// deno-lint-ignore no-namespace
export namespace Option {
  export type Some<T> = {
    ok: true;
    value: T;
  };

  export type None = {
    ok: false;
  };

  export function some<T>(value: T): Option.Some<T> {
    return { ok: true, value };
  }

  export const none = { ok: false } satisfies Option.None;
}
