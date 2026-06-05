import type { JSX } from "react";
import type { PageProps } from "./type.ts";

export default function ResourcesPage(props: PageProps): JSX.Element {
  const { config, params } = props;
  const name = params.name;

  if (typeof name !== "string") return <></>;

  const resource = config.resources[name];

  if (!resource) return <></>;

  const sources = config.sources.filter((source) => source.resource === name);

  return (
    <div>
      <h1>{name}</h1>
      <p>{resource.description}</p>

      {
        /* <ul>
        {sources.map(async (source) => {
          const locator = resolveLocator(source.locator, config.locators);

          const iter = locator.search({ options: source.locator });
          const array = await Array.fromAsync(iter);

          return array.map((url) => {
            const href = router.resolve({ type: "resource", id: url.href });

            return (
              <li key={url.href}>
                <a href={href}>{url.href}</a>
              </li>
            );
          });
        })}
      </ul> */
      }
    </div>
  );
}
