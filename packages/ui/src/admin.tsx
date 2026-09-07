import { type JSX, useMemo } from "react";
import Html from "./html.tsx";
import { Page, type RouteResult } from "./router.ts";
import { views } from "./pages/view.ts";
import type { Queries } from "./application/query.ts";
import { EnMessenger, type Messenger } from "./messenger.ts";
import { MessengerContext } from "./context/messenger.ts";

export interface AdminProps {
  route: RouteResult;
  queries: Queries;
  messenger?: Messenger;
}

export function Admin(props: AdminProps): JSX.Element {
  const { route, queries } = props;

  const messenger = useMemo(() => props.messenger ?? new EnMessenger(), [
    props.messenger,
  ]);

  return (
    <MessengerContext.Provider value={messenger}>
      <Html route={route} queries={queries}>
        <PageMatcher {...props} />
      </Html>
    </MessengerContext.Provider>
  );
}

function PageMatcher(props: AdminProps): JSX.Element {
  const { route } = props;

  switch (route.type) {
    case Page.ContentCreation: {
      return views[route.type].component(route.data);
    }
    case Page.Content: {
      return views[route.type].component(route.data);
    }
    case Page.Resource: {
      return views[route.type].component(route.data);
    }
    case Page.NotFound: {
      return views[route.type].component();
    }
    case Page.Home: {
      return views[route.type].component();
    }
    case Page.Assets: {
      return views[route.type].component();
    }
  }
}
