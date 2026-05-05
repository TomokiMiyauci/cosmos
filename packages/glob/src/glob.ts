import { globToRegExp, isGlob } from "@std/path";

export interface Entry {
  type: "file" | "directory" | "symlink";
  url: URL;
  name: string;
}

export interface ScannerAdapter {
  stat(url: URL): Promise<Entry>;
  readDir(url: URL): AsyncIterable<Entry>;
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

    const entry = await this.adapter.stat(currentRoot);

    if (dynamicSegments.length > 0) {
      if (entry.type !== "directory") return;
      yield* this.processSegments([entry], dynamicSegments);
    } else {
      yield entry;
    }
  }

  private async *processSegments(
    matches: Entry[],
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
    const nextMatches = new Map<string, Entry>();

    for (const match of matches) {
      for await (const next of this.advanceMatch(match, currentSegment)) {
        nextMatches.set(next.url.href, next);
      }
    }

    yield* this.processSegments([...nextMatches.values()], remainingSegments);
  }

  private async *advanceMatch(
    current: Entry,
    segment: string,
  ): AsyncIterable<Entry> {
    if (current.type !== "directory") return;

    if (segment === "**") {
      yield current;

      for await (const sub of this.walk(current.url)) {
        if (sub.type === "directory") yield sub;
      }
    } else {
      const re = globToRegExp(segment, {
        globstar: this.options.globstar,
        caseInsensitive: this.options.caseInsensitive,
      });

      for await (const sub of this.adapter.readDir(current.url)) {
        if (re.test(sub.name)) {
          yield sub;
        }
      }
    }
  }

  private async *walk(
    url: URL,
    visited = new Set<string>(),
  ): AsyncIterable<Entry> {
    if (visited.has(url.href)) return;
    visited.add(url.href);

    for await (const sub of this.adapter.readDir(url)) {
      yield sub;

      switch (sub.type) {
        case "symlink":
        case "file": {
          continue;
        }
        case "directory": {
          yield* this.walk(sub.url, visited);
        }
      }
    }
  }
}
