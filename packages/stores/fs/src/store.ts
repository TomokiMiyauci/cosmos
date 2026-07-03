import type { Store } from "@cosmos/store-repository";

export class DenoFsStore implements Store {
  async get(url: URL): Promise<Blob | null> {
    try {
      const text = await Deno.readFile(url);

      return new Blob([text]);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      }

      throw e;
    }
  }

  async put(url: URL, blob: Blob): Promise<void> {
    const stream = blob.stream();

    await Deno.writeFile(url, stream);
  }

  async delete(url: URL): Promise<void> {
    return Deno.remove(url);
  }
}
