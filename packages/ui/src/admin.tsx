import type { JSX } from "react";
import type { TranslationService } from "./translation.ts";
import Html from "./html.tsx";
import { Page, type RouteResult } from "./router.ts";
import { views } from "./pages/view.ts";
import type { Queries } from "./application/query.ts";

export interface AdminProps {
  route: RouteResult;
  queries: Queries;
  translation: TranslationService;
}

export function Admin(props: AdminProps): JSX.Element {
  const { translation, route, queries } = props;

  return (
    <Html route={route} queries={queries} translation={translation}>
      <PageMatcher {...props} />
    </Html>
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
