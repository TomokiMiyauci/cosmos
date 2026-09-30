import type { JSX, ReactNode } from "react";
import type { Model } from "./application/query.ts";
import { PageLayout } from "~component";
import type { Queries } from "~hook";

export interface LayoutProps {
  models: Model[];
  queries: Queries;
}

export async function getStaticProps(queries: Queries): Promise<LayoutProps> {
  const models = await queries.model.list();

  return { models, queries };
}

export interface HtmlProps extends LayoutProps {
  children?: ReactNode;
}

export default function Html(props: HtmlProps): JSX.Element {
  const { children, models } = props;

  return (
    <html>
      <head></head>

      <PageLayout models={models}>
        {children}
      </PageLayout>
    </html>
  );
}
