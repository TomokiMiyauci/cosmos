export interface IO {
  write(url: URL, stream: ReadableStream<Uint8Array>): Promise<void>;

  read(url: URL): Promise<ReadableStream<Uint8Array>>;

  delete(url: URL): Promise<void>;
}
