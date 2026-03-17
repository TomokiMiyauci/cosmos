export interface Driver {
  query(sql: string): Uint8Array;
}
