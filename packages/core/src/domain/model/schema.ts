class StringSchema {
  constructor() {}

  // deno-lint-ignore no-misused-new
  static new(): StringSchema {
    return new StringSchema();
  }

  validate(dto: NodeJson): boolean {
    return dto.type === "string";
  }
}

class NumberSchema {
  constructor() {}

  // deno-lint-ignore no-misused-new
  static new(): NumberSchema {
    return new NumberSchema();
  }

  validate(dto: NodeJson): boolean {
    return dto.type === "number";
  }
}

// deno-lint-ignore no-namespace
namespace Schema {
  export function of(dto: SchemaJson): Schema {
    switch (dto.type) {
      case "string": {
        return StringSchema.new();
      }
      case "number": {
        return NumberSchema.new();
      }
    }
  }
}

export type Schema = StringSchema | NumberSchema;

type SchemaJson = StringSchemaJson | NumberSchemaJson;

interface StringSchemaJson {
  type: "string";
}

interface NumberSchemaJson {
  type: "number";
}

export type NodeJson = StringNodeJson | NumberNodeJson;

interface StringNodeJson {
  type: "string";
  value: string;
}

interface NumberNodeJson {
  type: "number";
  value: number;
}
