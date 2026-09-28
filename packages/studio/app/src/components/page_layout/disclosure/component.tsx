"use client";

import {
  type ConsumerProps,
  createContext,
  type JSX,
  type PropsWithChildren,
  use,
  useId,
  useState,
} from "react";

export interface Discloure {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  id: string;
}

const Context = createContext<Discloure | null>(null);

export function DisclosureProvider(
  props: PropsWithChildren,
): JSX.Element {
  const id = useId();
  const [state, onChange] = useState(false);

  function toggle(): void {
    onChange((value) => !value);
  }

  function open(): void {
    onChange(true);
  }

  function close(): void {
    onChange(false);
  }

  const value = { isOpen: state, id, toggle, open, close } satisfies Discloure;

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}

export function useDisclosure(): Discloure {
  const context = use(Context);

  if (!context) throw new Error("wrap by <DiscoreuProvider>");

  return context;
}

export function DisclosureConsumer(
  props: ConsumerProps<Discloure>,
): JSX.Element {
  return (
    <Context.Consumer>
      {(value) => {
        if (!value) throw new Error();

        return props.children(value);
      }}
    </Context.Consumer>
  );
}
