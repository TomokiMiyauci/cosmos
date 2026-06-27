import type { JSX } from "react";
import type { CmsService } from "../type.ts";

export interface AssetsPageProps {
  service: CmsService;
}

export default function AssetsPage(_: AssetsPageProps): JSX.Element {
  return (
    <div>
      <h1>Assets</h1>
    </div>
  );
}
