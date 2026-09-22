import type { JSX, ReactNode } from "react";
import type { Model, ModelQuery } from "./application/query.ts";
import { PageLayout } from "~component";

export interface LayoutProps {
  models: Model[];
}

export async function getStaticProps(query: ModelQuery): Promise<LayoutProps> {
  const models = await query.list();

  return { models };
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
