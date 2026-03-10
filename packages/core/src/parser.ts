import type {
  BooleanValue,
  Content,
  ContentNode,
  ContentValue,
  Model,
  ReferenceValue,
  StringValue,
} from "./type.ts";

export class Parser {
  *parse(content: Content, model: Model): Iterable<ContentNode> {
    for (const def of model.fields) {
      if (!def.required && !(def.name in content)) {
        continue;
      }

      const value = content[def.name];

      switch (def.type) {
        case "string": {
          if (new StringValidator().validate(value)) {
            yield { name: def.name, value: { type: "string", value } };
            continue;
          }

          throw new Error();
        }
        case "boolean": {
          if (new BooleanValidator().validate(value)) {
            yield { name: def.name, value: { type: "boolean", value } };
            continue;
          }

          throw new Error();
        }

        case "reference": {
          if (new ReferenceValidator().validate(value)) {
            yield { name: def.name, value: { type: "reference", value } };
            continue;
          }

          throw new Error();
        }
      }
    }
  }

  stringify(contentNodes: Iterable<ContentNode>): Content {
    return [...contentNodes].reduce<Content>((acc, cur) => {
      acc[cur.name] = strinigy(cur.value);

      return acc;
    }, {});
  }
}

function strinigy(value: ContentValue): unknown {
  switch (value.type) {
    case "string":
      return new StringSerializer().serialize(value);
    case "boolean":
      return new BooleanSerializer().serialize(value);
    case "reference":
      return new ReferenceSerializer().serialize(value);
  }
}

class StringSerializer {
  serialize(node: StringValue): string {
    return node.value;
  }
}

class BooleanSerializer {
  serialize(node: BooleanValue): boolean {
    return node.value;
  }
}

class ReferenceSerializer {
  serialize(node: ReferenceValue): URLPatternInit {
    return node.value;
  }
}

class StringValidator {
  validate(value: unknown): value is string {
    return typeof value === "string";
  }
}

class BooleanValidator {
  validate(value: unknown): value is boolean {
    return typeof value === "boolean";
  }
}

class ReferenceValidator {
  validate(value: unknown): value is URLPatternInit {
    return !!value && typeof value === "object";
  }
}
