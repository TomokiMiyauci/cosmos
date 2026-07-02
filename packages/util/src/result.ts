export type Result<T, E> = Result.Ok<T> | Result.Error<E>;

// deno-lint-ignore no-namespace
export namespace Result {
  export type Ok<T> = {
    ok: true;
    value: T;
  };

  export type Error<E> = {
    ok: false;
    error: E;
  };

  export function ok<T>(value: T): Result.Ok<T> {
    return { ok: true, value };
  }

  export function error<E>(error: E): Result.Error<E> {
    return { ok: false, error };
  }
}
