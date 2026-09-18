import {
  createContext,
  Fragment,
  type JSX,
  type ReactNode,
  use,
  useEffectEvent,
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

export interface TemplateProps extends ShadowRootInit {
  children?: ReactNode;
}

export function Template(props: TemplateProps): JSX.Element {
  const {
    children,
    mode,
    clonable,
    customElementRegistry,
    delegatesFocus,
    serializable,
    slotAssignment,
  } = props;

  const host = use(HostContext);
  const { isServer } = use(RenderContext);

  useLayoutEffect(() => {
    // remove browser DSD shadow root children's.
    host?.shadowRoot?.replaceChildren();
  }, [host]);

  const init = {
    mode,
    clonable,
    customElementRegistry,
    delegatesFocus,
    serializable,
    slotAssignment,
  } satisfies ShadowRootInit;

  const templateProps = {
    shadowrootmode: init.mode,
    shadowrootclonable: init.clonable,
    // shadowrootcustomelementregistry: init.customElementRegistry,
    shadowrootdelegatesfocus: init.delegatesFocus,
    shadowrootserializable: init.serializable,
    shadowrootslotassignment: init.slotAssignment,
  };

  return (
    <>
      {isServer && (
        <template {...templateProps}>
          {children}
        </template>
      )}

      <ShadowRoot host={host} {...init}>{children}</ShadowRoot>
    </>
  );
}

export interface ShadowRootProps extends ShadowRootInit {
  host: Element | null;
  children?: ReactNode;
}

export function ShadowRoot(props: ShadowRootProps): JSX.Element {
  const {
    host,
    children,
    mode,
    clonable,
    customElementRegistry,
    delegatesFocus,
    serializable,
    slotAssignment,
  } = props;
  const init = {
    mode,
    clonable,
    customElementRegistry,
    delegatesFocus,
    serializable,
    slotAssignment,
  } satisfies ShadowRootInit;

  const shadowRoot = useShadowRoot(host, init);

  if (shadowRoot) return createPortal(children, shadowRoot);

  return <Fragment />;
}

function useShadowRoot(
  host: Element | null,
  init: ShadowRootInit,
): ShadowRoot | null {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  const onAttach = useEffectEvent((host: Element | null) => {
    if (!host) return;

    setShadowRoot(host.shadowRoot ?? host.attachShadow(init));
  });

  useLayoutEffect(() => {
    onAttach(host);
  }, [host]);

  return shadowRoot;
}
