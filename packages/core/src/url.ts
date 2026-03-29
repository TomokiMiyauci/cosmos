import type {
  Formatter,
  FormatterDefinitionBase,
  IO,
  Resolver,
} from "./type.ts";

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

export function createIO(resolvers: Resolver[]): IO {
  return {
    reader: {
      read: (url) => {
        const resolved = resolve(resolvers, url);
        return resolved.reader.read(url);
      },
    },
    storage: {
      read: (url) => {
        const resolved = resolve(resolvers, url);
        return resolved.storage.read(url);
      },
      write: (url, content) => {
        const resolved = resolve(resolvers, url);
        return resolved.storage.write(url, content);
      },
      delete: (url) => {
        const resolved = resolve(resolvers, url);
        return resolved.storage.delete(url);
      },
    },
  };
}

function resolve(resolvers: Resolver[], url: URL): IO {
  for (const resolver of resolvers) {
    const resolved = resolver.resolve(url);
    if (resolved) return resolved;
  }

  throw new Error();
}
