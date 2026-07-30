"use client";

import { type JSX, useState } from "react";
import type { Data, Entry, Field } from "../type.ts";
import type { Node } from "@cosmos/core";
import { Page, resolvePath } from "../router.ts";
import Form from "../form.tsx";
import type { Result } from "@miyauci/util";
import type { FieldDefinition, Store, StoreElement } from "../fields/type.ts";
import { mapValues } from "@std/collections/map-values";

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
      <Form
        store={store}
        update={handleAction}
        field={definition}
        id={id}
        onChange={setState}
      />

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

function toFieldDefinition(field: Field): FieldDefinition {
  switch (field.type) {
    case "string": {
      return {
        type: "string",
      };
    }
    case "number": {
      return {
        type: "number",
      };
    }
    case "map": {
      const properties = mapValues(field.fields, toFieldDefinition);

      return {
        type: "map",
        properties,
      };
    }
    case "list": {
      return {
        type: "list",
        item: toFieldDefinition(field.field),
      };
    }
    case "boolean":
    case "reference":
    case "datetime":
    case "asset":
    case "union": {
      return {
        type: "string",
      };
    }
  }
}

function node2Store(node: NodeWithId): Store {
  switch (node.type) {
    case "number":
    case "string": {
      return {
        [node.id]: node,
      };
    }
    case "map": {
      const keyed = mapValues(
        node.value,
        (childNode) => ({ node: childNode, id: childNode.id }),
      );

      const h = Object.values(keyed).map((x) =>
        [x.id, toStoreElement(x.node)] as const
      );

      const store = Object.fromEntries(h);

      return {
        [node.id]: toStoreElement(node),
        ...store,
      };
    }
    case "list": {
      return {};
    }
    case "boolean":
    case "datetime":
    case "reference":
    case "union":
    case "asset": {
      return {
        [node.id]: toStoreElement(node),
      };
    }
  }
}

function toStoreElement(node: NodeWithId): StoreElement {
  switch (node.type) {
    case "string": {
      return { type: "string", value: node.value };
    }
    case "number": {
      return {
        type: "number",
        value: node.value,
      };
    }
    case "map": {
      const value = mapValues(node.value, (node) => node.id);

      return {
        type: "link",
        value,
      };
    }
    case "list": {
      const value = node.value.map((node) => node.id);

      return {
        type: "list",
        value,
      };
    }
    case "boolean":
    case "reference":
    case "datetime":
    case "asset":
    case "union": {
      return {
        type: "string",
        value: "unklwon",
      };
    }
  }
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
