import {
  createContext,
  Fragment,
  type JSX,
  type ReactNode,
  use,
  useLayoutEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

export interface ShadowHostProps {
  children?: ReactNode;
  isServer?: boolean;
}

export function ShadowHost(props: ShadowHostProps): JSX.Element {
  const { children, isServer = !("document" in globalThis) } = props;
  const [host, setHost] = useState<Element | null>(null);

  return (
    <div ref={setHost}>
      <HostContext.Provider value={host}>
        <RenderContext.Provider value={{ isServer }}>
          {children}
        </RenderContext.Provider>
      </HostContext.Provider>
    </div>
  );
}

const HostContext = createContext<Element | null>(null);
const RenderContext = createContext({ isServer: false });

export interface TemplateProps {
  children?: ReactNode;
}

export function Template(props: TemplateProps): JSX.Element {
  const { children } = props;

  const host = use(HostContext);
  const { isServer } = use(RenderContext);

  useLayoutEffect(() => {
    host?.shadowRoot?.replaceChildren();
  }, [host]);

  return (
    <>
      {isServer && (
        <template shadowrootmode="open">
          {children}
        </template>
      )}

      <ShadowRoot host={host}>{children}</ShadowRoot>
    </>
  );
}

export interface ShadowRootProps {
  host: Element | null;
  children?: ReactNode;
}

export function ShadowRoot(props: ShadowRootProps): JSX.Element {
  const { host, children } = props;

  const shadowRoot = useShadowRoot(host, { mode: "open" });

  if (shadowRoot) return createPortal(children, shadowRoot);

  return <Fragment />;
}

function useShadowRoot(
  host: Element | null,
  init: ShadowRootInit,
): ShadowRoot | null {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    if (!host) return;

    setShadowRoot(host.shadowRoot ?? host.attachShadow(init));
  }, [host]);

  return shadowRoot;
}
