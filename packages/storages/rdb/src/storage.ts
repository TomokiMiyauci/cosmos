import type { Storage } from "@cosmos/core";
import type { Driver } from "./type.ts";

export class RdbStorage implements Storage {
  constructor(private driver: Driver) {}

  read(url: URL): Uint8Array | Promise<Uint8Array> {
    const { table } = parseRdbUrl(url);

    return this.driver.query(`SELECT * from ${table}`);
  }

  write(url: URL, conetnt: Uint8Array): void | Promise<void> {
  }

  list(url: URL): URL[] | Promise<URL[]> {
    if (url.protocol !== "rdb") return;
  }
}

interface Parsed {
  table: string;
}

function parseRdbUrl(url: URL): Parsed {
}
