export { Admin, type AdminProps } from "./admin.tsx";
export { Page, Router } from "./router.ts";
export {
  type CmsService,
  type Content,
  type ContentsOption,
  type Entry,
  type Field,
  type Identity,
  type Summary,
  type Template,
} from "./type.ts";
export { I18n } from "./translation.ts";
export { type Queries } from "./application/query.ts";
export { type Services } from "./application/service.ts";
import en from "./locales/en.json" with { type: "json" };

import TextControl from "./widgets/text.tsx";

export { TextControl };

export { en };
