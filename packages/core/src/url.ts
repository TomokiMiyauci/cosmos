import { join } from "@std/path";
import type { Formatter, FormatterDefinitionBase } from "./type.ts";

export class StructuredURL extends URL implements URL {
  constructor(url: URLPatternInit, base?: URLPatternInit) {
    const merged = mergeURLPatternInput(base ?? {}, url);

    const urlStr = toURLStr(merged);

    super(urlStr);
  }
}

function toURLStr(pattern: URLPatternInit): string {
  const {
    protocol = "",
    hostname = "",
    pathname = "",
    password = "",
    search = "",
    hash = "",
    port,
    username,
  } = pattern;

  let auth = "";
  if (username) {
    auth = username;
    if (password) auth += `:${password}`;
    auth += "@";
  }

  const hostPort = port ? `${hostname}:${port}` : hostname;
  const searched = search && !search.startsWith("?") ? `?${search}` : search;
  const hashed = hash && !hash.startsWith("#") ? `#${hash}` : hash;
  const proto = protocol.endsWith(":") ? protocol : `${protocol}:`;

  return `${proto}//${auth}${hostPort}${pathname}${searched}${hashed}`;
}

export function mergeURLPatternInput(
  left: URLPatternInit,
  right: URLPatternInit,
): URLPatternInit {
  return {
    protocol: right.protocol ?? left.protocol,
    hash: right.hash ?? left.hash,
    hostname: right.hostname ?? left.hostname,
    password: right.password ?? left.password,
    port: right.port ?? left.port,
    baseURL: right.baseURL ?? left.baseURL,
    search: right.search ?? left.search,
    username: right.username ?? left.username,
    pathname: mergePathname(right.pathname, left.pathname),
  };
}

export function mergePathname(
  left: string | undefined,
  right: string | undefined,
): string | undefined {
  if (typeof left === "undefined" && typeof right === "undefined") return;

  if (typeof left === "string" && typeof right === "string") {
    return join(right, left);
  }

  if (typeof left === "string") return left;

  return right;
}

export function resolveFormatter(
  format: FormatterDefinitionBase<string>,
  map: FormatterMap,
): Formatter {
  const formatter = map[format.type];

  if (!formatter) throw new Error("unknown formatter");

  return formatter;
}

export interface FormatterMap {
  [type: string]: Formatter;
}
