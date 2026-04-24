import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  ListNode,
  MapNode,
  MarkdonwNode,
  Node,
  NumberNode,
  ReferenceNode,
  RootNodeMapNode,
  StringNode,
  UnionNode,
} from "@cosmos/core";

export interface NodeCallback<T extends Node = Node, U extends Node = T> {
  (node: T): U | null | void;
}

export function walk(node: Node, callback: NodeCallback): Node | null {
  const result = callback(node);

  if (result === null) return null;

  const current = result ?? node;

  switch (current.type) {
    case "map": {
      const nextValue: Record<string, Node> = {};

      for (const [key, child] of Object.entries(current.value)) {
        const result = walk(child, callback);

        if (result) {
          nextValue[key] = result;
        }
      }
      return { ...current, value: nextValue };
    }

    case "list": {
      const value = current.value.map((node) => walk(node, callback)).filter((
        node,
      ) => !!node);

      return {
        ...current,
        value,
      };
    }

    case "markdown": {
      const value = current.value.value.map((node) => walk(node, callback))
        .filter((node) => !!node) as RootNodeMapNode[];

      return {
        ...current,
        value: {
          type: "list",
          value,
        },
      };
    }

    case "union": {
      const result = walk(current.value, callback);

      if (!result) return null;

      return {
        ...current,
        value: result,
      };
    }

    default:
      return current;
  }
}

export interface Visitor {
  string?: NodeCallback<StringNode>;
  number?: NodeCallback<NumberNode>;
  boolean?: NodeCallback<BooleanNode>;
  list?: NodeCallback<ListNode>;
  map?: NodeCallback<MapNode>;
  reference?: NodeCallback<ReferenceNode>;
  datetime?: NodeCallback<DatetimeNode>;
  asset?: NodeCallback<AssetNode>;
  union?: NodeCallback<UnionNode>;
  markdown?: NodeCallback<MarkdonwNode>;
}

export function composeVisitor(visitors: Iterable<Visitor>): Visitor {
  const visitorArray = [...visitors];

  const createPipeline = <T extends Node>(key: keyof Visitor) => {
    const handlers = visitorArray
      .map((visitor) => visitor[key]! as unknown as NodeCallback<T>)
      .filter((callback): callback is NodeCallback<T> => !!callback);

    if (handlers.length === 0) return;

    return (node: T) => {
      let current = node;

      for (const handler of handlers) {
        const result = handler(current);
        if (result === null) return null;
        current = (result ?? current) as T;
      }

      return current;
    };
  };

  return {
    string: createPipeline("string"),
    boolean: createPipeline("boolean"),
    asset: createPipeline("asset"),
    datetime: createPipeline("datetime"),
    list: createPipeline("list"),
    map: createPipeline("map"),
    markdown: createPipeline("markdown"),
    number: createPipeline("number"),
    reference: createPipeline("reference"),
    union: createPipeline("union"),
  };
}

export function createCallback(visitor: Visitor): NodeCallback {
  return (node) => {
    switch (node.type) {
      case "string": {
        return visitor.string?.(node);
      }
      case "number": {
        return visitor.number?.(node);
      }
      case "boolean": {
        return visitor.boolean?.(node);
      }
      case "list": {
        return visitor.list?.(node);
      }
      case "reference": {
        return visitor.reference?.(node);
      }
      case "datetime": {
        return visitor.datetime?.(node);
      }
      case "asset": {
        return visitor.asset?.(node);
      }
      case "union": {
        return visitor.union?.(node);
      }
      case "markdown": {
        return visitor.markdown?.(node);
      }
      case "map": {
        return visitor.map?.(node);
      }
    }
  };
}
