import type { IO } from "../type.ts";

export class DenoIO implements IO {
  async read(url: URL): Promise<ReadableStream<Uint8Array>> {
    const fs = await Deno.open(url);

    return fs.readable;
  }
  write(url: URL, stream: ReadableStream<Uint8Array>): Promise<void> {
    return Deno.writeFile(url, stream);
  }

  delete(url: URL): Promise<void> {
    return Deno.remove(url);
  }
}
