"use client";

import { type JSX, useState } from "react";
import type { Data, Entry } from "../type.ts";
import type { Node } from "@cosmos/core";
import { Page, resolvePath } from "../router.ts";
import Field from "../fields/field.tsx";
import type { Result } from "@miyauci/util";
import type { ErrorMap, Store } from "../fields/type.ts";
import { mapValues } from "@std/collections/map-values";
import { node2Store, toFieldDefinition, toNode } from "./util.ts";

export interface ContentPageProps {
  contentId: string;
  data: Data;
  onAction: (entry: Entry) => Promise<Result<Node, {}>>;
  onRemove: (id: string) => Promise<void>;
}

export default function ContentPage(
  props: ContentPageProps,
): JSX.Element {
  const { contentId, data, onAction, onRemove } = props;
  const { node: init, field, meta, name } = data;
  const id = "";
  const idNode = init ? withId(init, id) : null;
  const initStore = idNode ? node2Store(idNode) : {};
  const [store, setState] = useState<Store>(initStore);
  const [errors] = useState<ErrorMap>({});
  const definition = toFieldDefinition(field);

  async function update(node: Node): Promise<void> {
    const [data, error] = await onAction({
      id: contentId,
      node,
      summary: { name },
    });

    // if (error) {
    // } else {
    //   setState(data);
    //   alert("success");
    // }
  }

  async function handleAction(node: Node | null): Promise<void> {
    if (node) {
      await update(node);
    } else {
      await onRemove(contentId);
    }
  }

  async function remove(): Promise<void> {
    await onRemove(contentId);

    location.href = resolvePath(Page.Contents);
  }

  return (
    <div>
      <h1>Content</h1>

      <h2>{meta.title}</h2>
      <p>{meta.description}</p>

      <form
        action={async () => {
          "use server";
          const node = toNode(store, id);

          const result = await handleAction(node);
        }}
      >
        <Field
          store={store}
          changeStore={setState}
          definition={definition}
          id={id}
          errors={errors}
        />
        <button type="submit">Update</button>
      </form>

      <button
        type="button"
        onClick={() => {
          remove();
        }}
      >
        Delete
      </button>
    </div>
  );
}

function withId(node: Node, id?: string): NodeWithId {
  id ??= crypto.randomUUID();

  switch (node.type) {
    case "number":
    case "boolean":
    case "reference":
    case "datetime":
    case "asset":
    case "string": {
      return {
        id,
        ...node,
      };
    }

    case "union": {
      return {
        id,
        type: "union",
        key: node.key,
        value: withId(node.value),
      };
    }
    case "list": {
      return {
        id,
        type: "list",
        value: node.value.map((node) => withId(node)),
      };
    }
    case "map": {
      const value = mapValues(node.value, (node) => withId(node));

      return {
        id,
        type: "map",
        value,
      };
    }
    case "markdown": {
      throw new Error();
    }
  }
}

export type NodeWithId =
  | ReferenceNode
  | StringNode
  | NumberNode
  | BooleanNode
  | DatetimeNode
  | AssetNode
  | UnionNode
  | ListNode
  | MapNode;

interface BaseNode {
  id: string;
}

export interface ReferenceNode extends BaseNode {
  type: "reference";
  value: string;
}

export interface StringNode extends BaseNode {
  type: "string";
  value: string;
}

export interface NumberNode extends BaseNode {
  type: "number";
  value: number;
}

export interface BooleanNode extends BaseNode {
  type: "boolean";
  value: boolean;
}

export interface DatetimeNode extends BaseNode {
  type: "datetime";
  value: Date;
}

export interface AssetNode extends BaseNode {
  type: "asset";
  value: string;
}

export interface ListNode extends BaseNode {
  type: "list";
  value: NodeWithId[];
}

export interface MapNode extends BaseNode {
  type: "map";
  value: Record<string, NodeWithId>;
}

export interface UnionNode extends BaseNode {
  type: "union";
  key: string;
  value: NodeWithId;
}
