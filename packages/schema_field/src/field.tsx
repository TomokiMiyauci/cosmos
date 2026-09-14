import { type JSX, useId, useMemo, useState } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import type { SchemaValue } from "@cosmos/schema";
import type { Definition, NativeFormValue, Primitive } from "./type.ts";
import StringField from "./fields/string.tsx";
import NumberField from "./fields/number.tsx";
import BooleanField from "./fields/boolean.tsx";
import MapField from "./fields/map.tsx";
import UnionField from "./fields/union.tsx";
import SequenceField from "./fields/sequence.tsx";
import ReferenceField from "./fields/reference.tsx";
import type { FieldLayoutProps, FieldProps } from "./fields/type.ts";
import { cosmosResolver } from "./resolver.ts";
import { isIdentifier, isNumberValue } from "@cosmos/validator";
import { mapValues } from "@std/collections/map-values";

export interface UseFieldsReturn {
  setErrors(error: FieldError[]): void;
  finalize(): Promise<SchemaValue | null>;
  render(): JSX.Element;
}

export type Path = (string | number)[];

export function useFields(
  schema: Definition,
  init?: SchemaValue,
): UseFieldsReturn {
  const values = useMemo(() => {
    if (!init) return undefined;

    const value = toFormValues(init);

    return value;
  }, [init]);
  const form = useForm<FormValues, unknown, SchemaValue>({
    values,
    resolver: cosmosResolver(schema),
  });

  return {
    finalize(): Promise<SchemaValue | null> {
      const result = form.handleSubmit((data) => {
        return data;
      });

      return result().then((result) => result ?? null);
    },

    setErrors(errors: FieldError[]): void {
      form.clearErrors();

      for (const error of errors) {
        const name = path2Name([`content`, ...error.path]) as `content`;

        form.setError(name, { message: error.message });
      }
    },

    render(): JSX.Element {
      return <Fields definition={schema} controller={form} />;
    },
  };
}

function toFormValues(value: SchemaValue): FormValues {
  return {
    content: toNativeFormValue(value),
  };
}

function toNativeFormValue(value: SchemaValue): NativeFormValue {
  if (typeof value === "string") return value;

  if (isNumberValue(value)) return value.value.toString();

  if (typeof value === "boolean") return value.toString();

  if (isIdentifier(value)) return value.value;

  if (Array.isArray(value)) return value.map(toNativeFormValue);

  return mapValues(value, toNativeFormValue);
}

function path2Name(path: Path): string {
  return path.join(".");
}

export interface FieldError {
  path: Path;
  message: string;
}

export interface FieldsProps {
  controller: UseFormReturn<FormValues, unknown, SchemaValue>;
  definition: Definition;
}

interface FormValues {
  content: undefined | NativeFormValue;
}

export type Value = Value[] | Primitive | {
  [k: string]: Value;
};

export function Fields(props: FieldsProps): JSX.Element {
  return (
    <FormProvider {...props.controller}>
      <_Field
        definition={props.definition}
        name="content"
        ancestors={new Set()}
      />
    </FormProvider>
  );
}

interface _FieldProps {
  definition: Definition;
  name: string;
  ancestors: Set<Definition>;
  required?: boolean;
}

function FieldLayout(props: FieldLayoutProps): JSX.Element {
  const { title, control, error, id } = props;

  return (
    <>
      <label htmlFor={id}>
        <p>{title}</p>
      </label>

      {control}

      {error && <p>{error}</p>}
    </>
  );
}

function RecursiveField(props: FieldProps): JSX.Element {
  const { name, definition, render: Render } = props;
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button type="button" onClick={() => setExpanded(true)}>
        Open
      </button>
    );
  }

  return <Render name={name} definition={definition} />;
}

function _Field(props: _FieldProps): JSX.Element {
  const { definition, name, ancestors, required } = props;

  const id = useId();

  const baseFieldProps = {
    name,
    definition,
    layout: FieldLayout,
    required,
    id,
  };

  if (ancestors.has(definition)) {
    return (
      <RecursiveField
        {...baseFieldProps}
        render={({ name, definition, required }) => (
          <_Field
            ancestors={new Set()}
            name={name}
            definition={definition}
            required={required}
          />
        )}
      />
    );
  }

  const nextAncestors = new Set(ancestors);
  nextAncestors.add(definition);

  const fieldProps = {
    ...baseFieldProps,
    render: ({ name, definition, required }) => (
      <_Field
        ancestors={nextAncestors}
        name={name}
        definition={definition}
        required={required}
      />
    ),
  } satisfies FieldProps;

  switch (definition.type) {
    case "string": {
      return <StringField {...fieldProps} />;
    }
    case "number": {
      return <NumberField {...fieldProps} />;
    }
    case "boolean": {
      return <BooleanField {...fieldProps} />;
    }
    case "sequence": {
      return <SequenceField {...fieldProps} />;
    }
    case "map": {
      return <MapField {...fieldProps} definition={definition} />;
    }
    case "union": {
      return <UnionField {...fieldProps} />;
    }
    case "reference": {
      return <ReferenceField {...fieldProps} />;
    }
  }
}
