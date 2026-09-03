import { type JSX, useState } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import type { Definition } from "./type.ts";
import StringField from "./fields/string.tsx";
import NumberField from "./fields/number.tsx";
import BooleanField from "./fields/boolean.tsx";
import MapField from "./fields/map.tsx";
import UnionField from "./fields/union.tsx";
import SequenseField from "./fields/sequence.tsx";
import type { FieldLayoutProps, FieldProps } from "./fields/type.ts";

export interface UseFieldsReturn {
  getValues(): Value | null;
  setError(error: FieldError): void;
  form: UseFormReturn<FormValues, unknown, FormValues>;
}

export type Path = (string | number)[];

export function useFields(init?: Value): UseFieldsReturn {
  const values = init ? { content: init } : undefined;
  const form = useForm<FormValues>({ values });

  return {
    getValues(): Value | null {
      return normalize(form.getValues());
    },

    setError(error: FieldError): void {
      const name = path2Name([`content`, ...error.path]) as `content`;

      form.setError(name, { message: error.message });
    },

    form,
  };
}

function path2Name(path: Path): string {
  return path.join(".");
}

export interface FieldError {
  path: Path;
  message: string;
}

function normalize(value: FormValues): Value | null {
  const { content } = value;

  if (content === undefined) return null;

  return normalizeNativeFormValue(content);
}

function normalizeNativeFormValue(value: NativeFormValue): Value {
  if (Array.isArray(value)) {
    return value.filter(isNonNullable).map(normalizeNativeFormValue);
  } else if (typeof value === "object") {
    const result: Record<string, Value> = {};

    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        result[key] = normalizeNativeFormValue(val);
      }
    }

    return result;
  } else {
    return value;
  }
}

export interface FieldsProps {
  form: UseFormReturn<FormValues, unknown, FormValues>;
  definition: Definition;
}

type Primitive = string | number | boolean;

interface FormValues {
  content: undefined | NativeFormValue;
}

type NativeFormPrimitiveValue = Primitive;

type NativeFormValue = NativeFormPrimitiveValue | {
  [k: string]: NativeFormValue | undefined;
} | (NativeFormValue | null)[];

export type Value = Value[] | Primitive | {
  [k: string]: Value;
};

export function Fields(props: FieldsProps): JSX.Element {
  return (
    <FormProvider {...props.form}>
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
}

function FieldLayout(props: FieldLayoutProps): JSX.Element {
  const { title, control, error } = props;

  return (
    <>
      <label>
        <p>{title}</p>

        {control}
      </label>

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
  const { definition, name, ancestors } = props;

  const baseFieldProps = { name, definition, layout: FieldLayout };

  if (ancestors.has(definition)) {
    return (
      <RecursiveField
        {...baseFieldProps}
        render={({ name, definition }) => (
          <_Field ancestors={new Set()} name={name} definition={definition} />
        )}
      />
    );
  }

  const nextAncestors = new Set(ancestors);
  nextAncestors.add(definition);

  const fieldProps = {
    ...baseFieldProps,
    render: ({ name, definition }) => (
      <_Field ancestors={nextAncestors} name={name} definition={definition} />
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
      return <SequenseField {...fieldProps} />;
    }
    case "map": {
      return <MapField {...fieldProps} />;
    }
    case "union": {
      return <UnionField {...fieldProps} />;
    }
  }
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !!value;
}
