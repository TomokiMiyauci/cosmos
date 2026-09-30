import { type FC, type ReactNode, type Usable, use } from "react";

export interface UseProps<T> {
  value: Usable<T>;
  children: FC<T>;
}

export default function Use<T>(
  props: UseProps<T>,
): ReactNode | Promise<ReactNode> {
  const { value, children } = props;
  const used = use(value);

  return children(used);
}
