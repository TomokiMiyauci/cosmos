export interface TranslationService {
  translate(key: TranslationKey): string;
}

export class I18n implements TranslationService {
  constructor(private value: Record<TranslationKey, string>) {}

  translate(key: TranslationKey): string {
    return this.value[key];
  }
}

export type TranslationKey =
  | "page.home.title"
  | "page.assets.title"
  | "page.resources.title";
