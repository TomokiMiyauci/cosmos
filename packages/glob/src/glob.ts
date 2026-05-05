import { globToRegExp, isGlob } from "@std/path";

export type EntryType = "file" | "directory" | "symlink";

export interface Source {
  type: EntryType;
  name: string;
}

export interface Entry {
  type: EntryType;
  url: URL;
}

interface InternalEntry extends Entry {
  name: string;
}

export interface ScannerAdapter {
  stat(url: URL): Promise<EntryType>;
  readDir(url: URL): AsyncIterable<Source>;
}

export class Glob {
  constructor(
    private adapter: ScannerAdapter,
    private options: { globstar?: boolean; caseInsensitive?: boolean } = {},
  ) {}

  async *scan(patternUrl: URL): AsyncIterable<Entry> {
    const segments = patternUrl.pathname.split("/").filter(Boolean);

    const firstGlobIndex = segments.findIndex((seg) => isGlob(seg));
    const fixedCount = firstGlobIndex === -1 ? segments.length : firstGlobIndex;

    const fixedSegments = segments.slice(0, fixedCount);
    const dynamicSegments = segments.slice(fixedCount);

    const currentRoot = fixedSegments.reduce((base, seg, i) => {
      const isLast = i === fixedSegments.length - 1;
      const suffix = (!isLast || dynamicSegments.length > 0) ? "/" : "";

      return new URL(encodeURIComponent(seg) + suffix, base);
    }, new URL("/", patternUrl));

    const type = await this.adapter.stat(currentRoot);

    const rootEntry: InternalEntry = {
      type,
      url: currentRoot,
      name: fixedSegments[fixedSegments.length - 1] ?? "",
    };

    if (dynamicSegments.length > 0) {
      if (rootEntry.type !== "directory") return;
      yield* this.processSegments([rootEntry], dynamicSegments);
    } else {
      yield { type: rootEntry.type, url: rootEntry.url };
    }
  }

  private async *processSegments(
    matches: InternalEntry[],
    segments: string[],
  ): AsyncIterable<Entry> {
    if (segments.length === 0) {
      for (const match of matches) yield match;
      return;
    }

    const [currentSegment, ...remainingSegments] = segments as [
      string,
      ...string[],
    ];
    const nextMatches = new Map<string, InternalEntry>();

    for (const match of matches) {
      for await (const next of this.advanceMatch(match, currentSegment)) {
        nextMatches.set(next.url.href, next);
      }
    }

    yield* this.processSegments([...nextMatches.values()], remainingSegments);
  }

  private async *advanceMatch(
    current: InternalEntry,
    segment: string,
  ): AsyncIterable<InternalEntry> {
    if (current.type !== "directory") return;

    if (segment === "**") {
      yield current;

      for await (const sub of this.walk(current.url)) {
        yield sub;
      }
    } else {
      const re = globToRegExp(segment, {
        globstar: this.options.globstar,
        caseInsensitive: this.options.caseInsensitive,
      });

      for await (const sub of this.adapter.readDir(current.url)) {
        if (re.test(sub.name)) {
          yield this.createEntry(current.url, sub);
        }
      }
    }
  }

  private async *walk(
    url: URL,
    visited = new Set<string>(),
  ): AsyncIterable<InternalEntry> {
    if (visited.has(url.href)) return;
    visited.add(url.href);

    for await (const sub of this.adapter.readDir(url)) {
      const entry = this.createEntry(url, sub);

      yield entry;

      switch (sub.type) {
        case "symlink":
        case "file": {
          continue;
        }
        case "directory": {
          yield* this.walk(entry.url, visited);
        }
      }
    }
  }

  private createEntry(baseUrl: URL, source: Source): InternalEntry {
    return {
      name: source.name,
      type: source.type,
      url: new URL(
        encodeURIComponent(source.name) +
          (source.type === "directory" ? "/" : ""),
        baseUrl,
      ),
    };
  }
}
