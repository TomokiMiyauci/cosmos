import { type JSX, useMemo } from "react";
import Html from "./html.tsx";
import type { RouteResult } from "./router.ts";
import { Page } from "./pages/symbol.ts";
import { views } from "./pages/view.ts";
import { EnMessenger, type Messenger } from "./messenger.ts";
import { MessengerContext } from "./context/messenger.ts";

export interface AdminProps {
  route: RouteResult;
  messenger?: Messenger;
}

export function Admin(props: AdminProps): JSX.Element {
  const { route } = props;
  const messenger = useMemo(() => props.messenger ?? new EnMessenger(), [
    props.messenger,
  ]);

  return (
    <MessengerContext.Provider value={messenger}>
      <Html models={route.data.models}>
        <PageRenderer route={route} />
      </Html>
    </MessengerContext.Provider>
  );
}

interface PageRendererProps {
  route: RouteResult;
}

function PageRenderer(props: PageRendererProps): JSX.Element {
  const { route } = props;

  switch (route.type) {
    case Page.Entry: {
      return views[route.type].component(route.data);
    }
    case Page.EntryCreation: {
      return views[route.type].component(route.data);
    }
    case Page.EntryList: {
      return views[route.type].component(route.data);
    }
    case Page.NotFound: {
      return views[route.type].component();
    }
    case Page.Home: {
      return views[route.type].component();
    }
  }
}
