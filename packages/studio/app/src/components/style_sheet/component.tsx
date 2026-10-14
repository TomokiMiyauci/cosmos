import type { DetailedHTMLProps, JSX, StyleHTMLAttributes } from "react";

export interface StyleSheetProps extends
  Omit<
    DetailedHTMLProps<
      StyleHTMLAttributes<HTMLStyleElement>,
      HTMLStyleElement
    >,
    "children"
  > {
  children: CSSStyleSheet;
}

export default function StyleSheet(props: StyleSheetProps): JSX.Element {
  const { children, ...rest } = props;
  const css = Object.values(children.cssRules).map((rule) => rule.cssText).join(
    "\n",
  );

  return (
    <style suppressHydrationWarning {...rest}>
      {css}
    </style>
  );
}
