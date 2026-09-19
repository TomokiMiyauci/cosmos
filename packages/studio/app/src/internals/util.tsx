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

  return (
    <style suppressHydrationWarning {...rest}>
      {children.cssRules[0]?.cssText}
    </style>
  );
}
